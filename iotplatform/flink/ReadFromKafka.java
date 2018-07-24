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
import org.apache.flink.streaming.connectors.elasticsearch5.ElasticsearchSink;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer011;
import org.apache.flink.util.Collector;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.client.Requests;

import java.net.InetAddress;
import java.net.InetSocketAddress;
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

        List<InetSocketAddress> transportAddresses = new ArrayList<>();
        transportAddresses.add(new InetSocketAddress(InetAddress.getByName(parameterTool.getRequired("elasticsearch")), Integer.parseInt(parameterTool.getRequired("elasticsearch_port"))));
        System.out.println("Elasticsearch detected at: " + InetAddress.getByName(parameterTool.getRequired("elasticsearch")).toString());

        env
                .addSource(
                        new FlinkKafkaConsumer011<>(
                                parameterTool.getRequired("topic"),
                                new ArrayNodeDeserializationSchema(),
                                parameterTool.getProperties()
                        )
                )
                .flatMap(new FlatMapFunction<ObjectNode[], SensorReading>() {
                    @Override
                    public void flatMap(ObjectNode[] nodes, Collector<SensorReading> out) throws Exception {
                        for (ObjectNode node : nodes) {
                            if (!node.get("timestamp").isNumber() || !node.get("sensor_id").isTextual()) {
                                break;
                            }
                            if (node.get("value").isTextual()) {
                                out.collect(new SensorReading(
                                        node.get("timestamp").asLong(),
                                        node.get("sensor_id").asText(),
                                        node.get("value").asText()
                                ));
                            } else if (node.get("value").isFloatingPointNumber()) {
                                out.collect(new SensorReading(
                                        node.get("timestamp").asLong(),
                                        node.get("sensor_id").asText(),
                                        node.get("value").asDouble()
                                ));
                            } else if (node.get("value").isNumber()) {
                                out.collect(new SensorReading(
                                        node.get("timestamp").asLong(),
                                        node.get("sensor_id").asText(),
                                        node.get("value").asLong()
                                ));
                            }
                        }
                    }
                })
                .addSink(new ElasticsearchSink<>(config, transportAddresses, new ElasticsearchSinkFunction<SensorReading>() {
                    IndexRequest createIndexRequest(SensorReading element) {
                        Map<String, Object> json = new HashMap<>();
                        json.put("timestamp", element.getTimestamp());
                        json.put("sensor_id", element.getSensorId());
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
                }));

        env.enableCheckpointing(1000);
        env.execute(parameterTool.getRequired("topic"));
    }
}
