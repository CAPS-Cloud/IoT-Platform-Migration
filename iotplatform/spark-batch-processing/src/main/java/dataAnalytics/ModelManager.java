package dataAnalytics;

import java.util.ArrayList;
import java.util.List;

import org.apache.hadoop.util.Time;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.RowFactory;
import org.apache.spark.sql.SparkSession;

import Formatters.InputModelFormatter;
import Formatters.OutputModelSchema;
import dataAnalytics.algorithms.AlgorithmFactory;
import dataAnalytics.algorithms.AlgorithmInterface;

public class ModelManager {
	
	private AlgorithmInterface algorithm = null;
	private SparkSession spark = null;
	
	private static ModelManager model = null;
	
	private ModelManager(SparkSession spark){
		this.spark = spark;
	}
	
	/**
	 * Sets the SparkSessiong and gets the ModelManager singleton instance
	 * @param spark
	 * @return
	 */
	public static ModelManager getModelManager(SparkSession spark){
		
		model = new ModelManager(spark);
		return model;
	}
	
	/**
	 * Sets algorithm to be ran. It throws an exception if the algorithm selected doesn´t exists
	 * @param algName
	 * @return
	 * @throws Exception
	 */
	public ModelManager loadAlgorithm(String algName) throws Exception{

		this.algorithm = new AlgorithmFactory()
				.getAlgorithm(algName);
		
		return this;
	}
	
	/**
	 * 
	 * @param dataset
	 * @param hoursPredicted
	 * @return
	 * @throws Exception
	 */
	public Dataset<Row> run(Dataset<Row> dataset, long hoursPredicted) throws Exception{
		
		// Necesary to train the model
		dataset.cache();
		
		// Formatting input dataset to fit training dataset format
		dataset = new InputModelFormatter()
				.format(dataset);
		
		// Creating an training model
		algorithm.train(dataset);
		
		// Predicting data for the following day (one data per hour)
		long nanosInHour = 3600000000000l;
		long nanosInMilli = 1000000l;
		long time = Time.now() * nanosInMilli;
		
		List<Row> rows = new ArrayList<Row>();
		
		for(long i = 0; i < hoursPredicted; i++){
			
			double prediction = algorithm.predict(new double[]{time+(i*nanosInHour)});
			Row row = RowFactory.create(""+time,""+prediction);
			rows.add(row);
		}
		
		// Formatting dataset to fit Elasticsearch data format
		dataset =  spark.createDataFrame(
					rows, 
					new OutputModelSchema().getSchema()
				);
		
		return dataset;
	}
}
