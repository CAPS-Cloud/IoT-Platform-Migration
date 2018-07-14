import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.JsonNode;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.flink.api.common.functions.MapFunction;
import org.apache.flink.api.common.functions.RuntimeContext;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.streaming.util.serialization.JSONDeserializationSchema;
import org.apache.flink.api.java.utils.ParameterTool;
import org.apache.flink.streaming.api.TimeCharacteristic;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.TimestampExtractor;
import org.apache.flink.streaming.api.functions.windowing.WindowFunction;
import org.apache.flink.streaming.api.windowing.assigners.TumblingTimeWindows;
import org.apache.flink.streaming.api.windowing.time.Time;
import org.apache.flink.streaming.api.windowing.triggers.ProcessingTimeTrigger;
import org.apache.flink.streaming.api.windowing.windows.TimeWindow;
import org.apache.flink.util.Collector;
import org.apache.flink.streaming.connectors.elasticsearch.ElasticsearchSinkFunction;
import org.apache.flink.streaming.connectors.elasticsearch.RequestIndexer;
import org.apache.flink.streaming.connectors.elasticsearch5.ElasticsearchSink;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer011;
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

    DataStream<ObjectNode> messageStream = env
      .addSource(
        new FlinkKafkaConsumer011<>(
          parameterTool.getRequired("topic"),
          new JSONDeserializationSchema(),
          parameterTool.getProperties()
        )
      );

    messageStream
      .map(new MapFunction<ObjectNode, SensorReading>() {
        private static final long serialVersionUID = -6867736771747690202L;

        public SensorReading map(ObjectNode node) throws Exception {
          return new SensorReading(
			node.get("timestamp").asLong(),
            node.get("sensor_id").asText(),
            node.get("value").asText()
          );
        }
      })

      .addSink(new ElasticsearchSink<>(config, transportAddresses, new ElasticsearchSinkFunction<SensorReading>() {
        public IndexRequest createIndexRequest(SensorReading element) {
            Map<String, String> json = new HashMap<>();
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

    env.execute();
  }
}
