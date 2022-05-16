package Formatters;

import org.apache.spark.sql.types.DataTypes;
import org.apache.spark.sql.types.StructField;
import org.apache.spark.sql.types.StructType;

import constants.DatasetConstants.KafkaFields;

public class OutputModelSchema {
	
	/**
	 * 
	 * It returns the Elasticsearch data struct schema.
	 * <ul>
	 * <li>Elasticsearch data struct schema --> {sensor_id - string, timestamp - timestamp, value - double}</li>
	 * </ul>
	 * @return
	 */
	public StructType getSchema(){
		
		return DataTypes.createStructType(new StructField[] {
				DataTypes.createStructField(
						KafkaFields.KEY.getValue(), 
						DataTypes.StringType, 
						false
				),
				DataTypes.createStructField(
						KafkaFields.VALUE.getValue(), 
						DataTypes.StringType, 
						false
				)
		});
	}
}
