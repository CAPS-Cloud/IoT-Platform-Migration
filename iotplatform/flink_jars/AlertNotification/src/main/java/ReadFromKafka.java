import org.apache.flink.api.common.functions.FilterFunction;
import org.apache.flink.api.common.functions.MapFunction;
import org.apache.flink.api.java.utils.ParameterTool;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer011;
import org.apache.flink.streaming.util.serialization.JSONDeserializationSchema;

import static java.lang.System.currentTimeMillis;


public class ReadFromKafka {
    public static int count = 0; // Count is used to maintain the Delta change
    public static long timeDelta; 
    public static void main(String[] args) throws Exception {
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
		ParameterTool parameterTool = ParameterTool.fromArgs(args);
        DataStream<ObjectNode> stream = readFromKafka(env, parameterTool);
        DataStream<ObjectNode> filterValue = stream.filter(new FilterFunction<ObjectNode>(){
		@Override
		public boolean filter(ObjectNode value) throws Exception {
            timeDelta = currentTimeMillis();
			if (parameterTool.getRequired("alertType").equals("Maximum")) {
			    if((value.get("value").asDouble()) > Double.valueOf(parameterTool.getRequired("threshhold"))){
			        return true;
                }
                else {
			        count = 0; // Count is set to 0 when the sensor/predcition value drops below threshold value
			        return false;
                }
			}
			else {
				if((value.get("value").asDouble()) < Double.valueOf(parameterTool.getRequired("threshhold"))){
				    return true;
                }
                else {
				    count = 0;
				    return false;
                }
			}
		}});
		filterValue.map(new MapFunction<ObjectNode, Boolean>(){
		@Override
		public Boolean map(ObjectNode value) { // Frequency is actually the delta value specified by the user
            if (parameterTool.getRequired("alertType").equals("Maximum")) {
                if (value.get("value").asDouble() >= (Double.valueOf(parameterTool.getRequired("threshhold")) + (Integer.valueOf(parameterTool.getRequired("frequency")) * count))) {
                    new MailSender().sendEmail(parameterTool.getRequired("email"), value.get("value").asDouble(), parameterTool.getRequired("name"), value.get("timestamp").asLong(), timeDelta);
                    ++count;
                }
            }
            else {
                if (value.get("value").asDouble() <= (Double.valueOf(parameterTool.getRequired("threshhold")) - (Integer.valueOf(parameterTool.getRequired("frequency")) * count))) {
                    new MailSender().sendEmail(parameterTool.getRequired("email"), value.get("value").asDouble(), parameterTool.getRequired("name"), value.get("timestamp").asLong(), timeDelta);
                    ++count;
                }
            }
			return true;
		}
		});
     
        // execute program
        env.execute(parameterTool.getRequired("groud.id"));
    }

    public static DataStream<ObjectNode> readFromKafka(StreamExecutionEnvironment env, ParameterTool parameterTool) {
        env.enableCheckpointing(5000);
        // set up the execution environment

        DataStream<ObjectNode> stream = env.addSource(
                new FlinkKafkaConsumer011<>(
								parameterTool.getRequired("topic"),
                                new JSONDeserializationSchema(),
                                parameterTool.getProperties()
                        ));
        return stream;
    }
}
