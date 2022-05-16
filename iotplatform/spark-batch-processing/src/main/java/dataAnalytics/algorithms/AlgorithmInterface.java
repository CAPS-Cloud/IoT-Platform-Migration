package dataAnalytics.algorithms;

import java.io.IOException;

import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;

public interface AlgorithmInterface{
	
	/**
	 * It creates and trains a model using the specific algorithm
	 * @param dataset
	 * @throws IOException
	 */
	public void train(Dataset<Row> dataset) throws IOException;
	
	/**
	 * Given a list of features, it predicts the label using the model previously created. 
	 * It is necessary to previously train the model
	 * @param dataset
	 * @throws IOException
	 */
	public double predict(double[] fueatures);
}
