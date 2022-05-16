package beans.datamanager;

import beans.ArgumentBean;
import constants.ArgsConstants.ArgsOptions;

public class ArgumentBeanDataManager {

	public ArgumentBean getInfo(String[] args){
		
		ArgumentBean bean = new ArgumentBean();
		
		for(int i=0; i<args.length-1; i++){
			
			if(args[i].equals(ArgsOptions.TOPIC.getValue())){
				bean.setTopic(args[++i]);
			}
			
			else if(args[i].equals(ArgsOptions.ALGORITHM.getValue())){
				bean.setAlgorithm(args[++i]);		
			}
			
			else if(args[i].equals(ArgsOptions.INDEX.getValue())){
				bean.setIndex(args[++i]);
			}
			
			else if(args[i].equals(ArgsOptions.HOURS_PREDICTED.getValue())){
				bean.setHoursPredicted(Long.parseLong(args[++i]));
			}
			
			else if(args[i].equals(ArgsOptions.HOURS_DATA.getValue())){
				bean.setHoursData(Long.parseLong(args[++i]));
			}
			
			else if(args[i].equals(ArgsOptions.ES_ADDRESS.getValue())){
				String[] address = args[++i].split(":");
				if(address.length > 1){
					bean.setEsIP(address[0]);
					bean.setEsPort(address[1]);
				}
			}
			
			else if(args[i].equals(ArgsOptions.KAFKA_ADDRESS.getValue())){
				bean.setKafkaAddress(args[++i]);
			}
		}
		return bean;
	}

	public boolean checkArgs(ArgumentBean bean){
		
		if(
			bean.getTopic() == null
			|| bean.getAlgorithm() == null
			|| bean.getIndex() == null
			|| bean.getHoursPredicted() == null
			|| bean.getHoursData() == null
			|| bean.getEsIP() == null
			|| bean.getEsPort() == null
			|| bean.getKafkaAddress() == null
		) return false;
		
		else return true;
	}
}
