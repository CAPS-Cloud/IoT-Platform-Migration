import org.apache.flink.api.common.functions.FlatMapFunction;
import org.apache.flink.api.common.functions.RuntimeContext;
import org.apache.flink.api.java.utils.ParameterTool;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.node.ArrayNode;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.node.ValueNode;
import org.apache.flink.streaming.api.TimeCharacteristic;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.connectors.elasticsearch.ElasticsearchSinkFunction;
import org.apache.flink.streaming.connectors.elasticsearch.RequestIndexer;
import org.apache.flink.streaming.connectors.elasticsearch6.ElasticsearchSink;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer;
import org.apache.flink.streaming.util.serialization.JSONKeyValueDeserializationSchema;
import org.apache.flink.util.Collector;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.client.Requests;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.elasticsearch.client.RestClientBuilder;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
import org.apache.http.HttpHost;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ReadFromKafka {
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        env.registerType(SensorReading.class);
        env.setParallelism(1);
        env.setStreamTimeCharacteristic(TimeCharacteristic.EventTime);

        ParameterTool parameterTool = ParameterTool.fromArgs(args);

        Map<String, String> config = new HashMap<>();
        config.put("cluster.name", "elasticsearch");
        config.put("bulk.flush.max.actions", "1");



        List<HttpHost> httpHosts = new ArrayList<>();
	httpHosts.add(new HttpHost(parameterTool.getRequired("elasticsearch"), Integer.parseInt(parameterTool.getRequired("elasticsearch_port")), "http"));

        System.out.println("Elasticsearch detected at: " + parameterTool.getRequired("elasticsearch").toString());

// use a ElasticsearchSink.Builder to create an ElasticsearchSink
        ElasticsearchSink.Builder<SensorReading> esSinkBuilder = new ElasticsearchSink.Builder<>(
            httpHosts,
            new ElasticsearchSinkFunction<SensorReading>() {
                public IndexRequest createIndexRequest(SensorReading element) {
                    Map<String, Object> json = new HashMap<>();
		    System.out.println("Elasticsearch Sensor_id detected : " + element.getSensorId().toString());

                    json.put("timestamp", element.getTimestamp());
                    json.put("sensor_id", element.getSensorId());
                    json.put("device_id", element.getDeviceId());
                    json.put("value", element.getValue());
                    return Requests.indexRequest()
                            .index(parameterTool.getRequired("topic"))
                            .type("sensorReading")
                            .source(json);
                }

                @Override
                public void process(SensorReading element, RuntimeContext ctx, RequestIndexer indexer) {
                    indexer.add(createIndexRequest(element));
                }
            }
        );


        // configuration for the bulk requests; this instructs the sink to emit after every element, otherwise they would be buffered
        esSinkBuilder.setBulkFlushMaxActions(1);

        // provide a RestClientFactory for custom configuration on the internally created REST client
        esSinkBuilder.setRestClientFactory(
            restClientBuilder -> {
                restClientBuilder.setHttpClientConfigCallback(new RestClientBuilder.HttpClientConfigCallback() {
                    @Override
                    public HttpAsyncClientBuilder customizeHttpClient(HttpAsyncClientBuilder httpClientBuilder) {

                        // elasticsearch username and password
                        CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
                        credentialsProvider.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials(parameterTool.getRequired("elasticsearch_username"), parameterTool.getRequired("elasticsearch_password")));

                        return httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider);
                    }
                });
            }
        );

        env
                .addSource(
                        new FlinkKafkaConsumer<>(
                                parameterTool.getRequired("topic"),
                                new JSONKeyValueDeserializationSchema(true),
                                parameterTool.getProperties()
                        )
                )
                .flatMap(new FlatMapFunction<ObjectNode, SensorReading>() {
                    @Override
                    public void flatMap(ObjectNode node, Collector<SensorReading> out) throws Exception {
			    System.out.println("reading from kafka : " + node.get("value").get("sensor_id").toString());

                        if (!node.get("value").get("timestamp").isNumber() || !node.get("value").get("sensor_id").isTextual() || !node.get("value").get("device_id").isTextual()) {
                            return;
                        }
                        if (node.get("value").get("value").isTextual()) {
                            out.collect(new SensorReading(
                                    node.get("value").get("timestamp").asLong(),
                                    node.get("value").get("sensor_id").asText(),
                                    node.get("value").get("device_id").asText(),
                                    node.get("value").get("value").asText()
                            ));
                        } else if (node.get("value").get("value").isFloatingPointNumber()) {
                            out.collect(new SensorReading(
                                    node.get("value").get("timestamp").asLong(),
                                    node.get("value").get("sensor_id").asText(),
                                    node.get("value").get("device_id").asText(),
                                    node.get("value").get("value").asDouble()
                            ));
                        } else if (node.get("value").get("value").isNumber()) {
                            out.collect(new SensorReading(
                                    node.get("value").get("timestamp").asLong(),
                                    node.get("value").get("sensor_id").asText(),
                                    node.get("value").get("device_id").asText(),
                                    node.get("value").get("value").asLong()
                            ));
                        }
                    }
                })
                .addSink(esSinkBuilder.build());

        env.enableCheckpointing(1000);
        env.execute(parameterTool.getRequired("topic"));
    }
}

