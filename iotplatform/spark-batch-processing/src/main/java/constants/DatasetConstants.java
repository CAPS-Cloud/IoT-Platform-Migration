package constants;

public class DatasetConstants {
	
	/**
	 * Enum with Elasticsearch sensor data field names
	 * @author Laptop-Sergio
	 *
	 */
	public enum ElastichsearchFields {
		
		SENSOR_ID("sensor_id"),
	    TIMESTAMP("timestamp"),
	    VALUE("value");

	    private String value;

	    ElastichsearchFields(String value) {
	        this.value = value;
	    }

	    public String getValue() {
	        return this.value;
	    }
	}
	
	/**
	 * Enum with Kafka record field names
	 * @author Laptop-Sergio
	 *
	 */
	public enum KafkaFields {
		
	    KEY("key"),
	    VALUE("value");

	    private String value;

	    KafkaFields(String value) {
	        this.value = value;
	    }

	    public String getValue() {
	        return this.value;
	    }
	}

	/**
	 * Enum algorithm dataset field names
	 * @author Laptop-Sergio
	 *
	 */
	public enum AlgorithmFields {
		
		LABEL("label"),
	    FEATURES("features");

	    private String value;

	    AlgorithmFields(String value) {
	        this.value = value;
	    }

	    public String getValue() {
	        return this.value;
	    }
	}
}
