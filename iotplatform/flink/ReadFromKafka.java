import org.apache.flink.api.common.functions.MapFunction;
import org.apache.flink.api.common.functions.RuntimeContext;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.api.java.utils.ParameterTool;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
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
//import org.apache.flink.streaming.util.serialization.SimpleStringSchema;
/**
 * Simple example on how to read with a Kafka consumer
 *
 * Note that the Kafka source is expecting the following parameters to be set
 *  - "bootstrap.servers" (comma separated list of kafka brokers)
 *  - "zookeeper.connect" (comma separated list of zookeeper servers)
 *  - "group.id" the id of the consumer group
 *  - "topic" the name of the topic to read data from.
 *
 * You can pass these required parameters using "--bootstrap.servers host:port,host1:port1 --zookeeper.connect host:port --topic testTopic"
 *
 * This is a valid input example:
 *      --topic test --bootstrap.servers localhost:9092 --zookeeper.connect localhost:2181 --group.id myGroup
 *
 *
 */
public class ReadFromKafka {
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        ParameterTool parameterTool = ParameterTool.fromArgs(args);

        Map<String, String> config = new HashMap<>();
        config.put("cluster.name", "elasticsearch");
        config.put("bulk.flush.max.actions", "1");

        List<InetSocketAddress> transportAddresses = new ArrayList<>();
        // transportAddresses.add(new InetSocketAddress(InetAddress.getByName("elasticsearch"), 9300));
        transportAddresses.add(new InetSocketAddress(InetAddress.getByName("elasticsearch"), 9300));
        
        System.out.println("Elasticsearch detected at: " + InetAddress.getByName("elasticsearch").toString());

        DataStream<String> messageStream = env.addSource(
                new FlinkKafkaConsumer011<>(
                        parameterTool.getRequired("topic"),
                        new SimpleStringSchema(),
                        parameterTool.getProperties()));
        // print() will write the contents of the stream to the TaskManager's standard out stream
        // the rebelance call is causing a repartitioning of the data so that all machines
        // see the messages (for example in cases when "num kafka partitions" < "num flink operators"
        messageStream.rebalance().map(new MapFunction<String, String>() {
            private static final long serialVersionUID = -6867736771747690202L;
            @Override
            public String map(String value) throws Exception {
                return "Kafka and Flink says: " + value;
            }
        })
        .addSink(new ElasticsearchSink<>(config, transportAddresses, new ElasticsearchSinkFunction<String>() {
            public IndexRequest createIndexRequest(String element) {
                Map<String, String> json = new HashMap<>();
                json.put("data", element);
                return Requests.indexRequest()
                        .index("livedata")
                        .type("testtype")
                        .source(json);
            }
            @Override
            public void process(String element, RuntimeContext ctx, RequestIndexer indexer) {
                indexer.add(createIndexRequest(element));
            }
        }));
        env.execute();
    }
}
