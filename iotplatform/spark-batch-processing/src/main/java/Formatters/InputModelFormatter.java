package Formatters;

import org.apache.spark.ml.feature.VectorAssembler;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;

import constants.DatasetConstants.AlgorithmFields;
import constants.DatasetConstants.ElastichsearchFields;

public class InputModelFormatter {

	/**
	 * It formats input dataset to fit training dataset format.
	 * <ul>
	 * <li>Elasticsearch dataset format --> {sensor_id - string, timestamp - timestamp, value - double}</li>
	 * <li>Input dataset format --> {label - double, features - vector}</li>
	 * </ul>
	 * @param dataset
	 * @return
	 */
	public Dataset<Row> format(Dataset<Row> dataset){
		
		dataset = dataset
				.drop(ElastichsearchFields.SENSOR_ID.getValue())
				.withColumn(
						AlgorithmFields.LABEL.getValue(), 
						dataset.col(ElastichsearchFields.VALUE.getValue())
							.cast("double")
				)
				.withColumn(
						ElastichsearchFields.TIMESTAMP.getValue(), 
						dataset.col(ElastichsearchFields.TIMESTAMP.getValue())
							.cast("long")
				)
				.drop(ElastichsearchFields.VALUE.getValue());

		String[] features = {ElastichsearchFields.TIMESTAMP.getValue()};
		
		VectorAssembler assembler = new VectorAssembler()
				.setInputCols(features)
				.setOutputCol(AlgorithmFields.FEATURES.getValue());
				
        dataset = assembler
        		.transform(dataset)
        		.drop(ElastichsearchFields.TIMESTAMP.getValue());
		
		return dataset;
	}
}
