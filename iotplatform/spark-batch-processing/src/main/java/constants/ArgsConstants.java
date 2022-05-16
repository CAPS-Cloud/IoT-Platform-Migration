package constants;

public class ArgsConstants {

	public enum ArgsOptions {
		
		TOPIC("--topic"),
	    ALGORITHM("--alg"),
	    INDEX("--index"),
	    HOURS_PREDICTED("--hours-predicted"),
		HOURS_DATA("--hours-data"),
		ES_ADDRESS("--es-address"),
		KAFKA_ADDRESS("--kafka-address");

	    private String value;

	    ArgsOptions(String value) {
	        this.value = value;
	    }

	    public String getValue() {
	        return this.value;
	    }
	}
	
	public static final String NOT_ALL_ARGS = "You need to specify all the obligatory arguments: "
			+ ArgsOptions.TOPIC.getValue()+": Kafka topic"
			+ ArgsOptions.ALGORITHM.getValue()+": algorithm selected"
			+ ArgsOptions.INDEX.getValue()+": Elasticsearch index"
			+ ArgsOptions.HOURS_PREDICTED.getValue()+": hours predicted"
			+ ArgsOptions.HOURS_DATA.getValue()+": period of time from where data is collected"
			+ ArgsOptions.ES_ADDRESS.getValue()+": Elasticsearch pod IP and port"
			+ ArgsOptions.KAFKA_ADDRESS.getValue()+": Kafka pod IP and port";
}
