package beans;

public class ArgumentBean {

	private String topic = null;
	private String algorithm = null;
	private String index = null;
	private Long hoursPredicted = null;
	private Long hoursData = null;
	private String esIP = null;
	private String esPort = null;
	private String kafkaAddress = null;
	
	public Long getHoursData() {
		return hoursData;
	}
	public void setHoursData(Long hoursData) {
		this.hoursData = hoursData;
	}
	public String getAlgorithm() {
		return algorithm;
	}
	public void setAlgorithm(String algorithm) {
		this.algorithm = algorithm;
	}
	public String getIndex() {
		return index;
	}
	public void setIndex(String index) {
		this.index = index;
	}

	public Long getHoursPredicted() {
		return hoursPredicted;
	}

	public void setHoursPredicted(Long hoursPredicted) {
		this.hoursPredicted = hoursPredicted;
	}

	public String getTopic() {
		return topic;
	}

	public void setTopic(String topic) {
		this.topic = topic;
	}
	public String getKafkaAddress() {
		return kafkaAddress;
	}
	public void setKafkaAddress(String kafkaAddress) {
		this.kafkaAddress = kafkaAddress;
	}
	public String getEsIP() {
		return esIP;
	}
	public void setEsIP(String esIP) {
		this.esIP = esIP;
	}
	public String getEsPort() {
		return esPort;
	}
	public void setEsPort(String esPort) {
		this.esPort = esPort;
	}

}
