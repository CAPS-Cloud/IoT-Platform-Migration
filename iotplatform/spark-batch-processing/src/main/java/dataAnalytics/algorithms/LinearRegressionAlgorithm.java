package dataAnalytics.algorithms;

import java.io.IOException;

import org.apache.spark.ml.linalg.Vectors;
import org.apache.spark.ml.regression.LinearRegression;
import org.apache.spark.ml.regression.LinearRegressionModel;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;

public class LinearRegressionAlgorithm implements AlgorithmInterface{
	
	private LinearRegressionModel model = null;
	
	@Override
	public void train(Dataset<Row> dataset)throws IOException{
		model = new LinearRegression().train(dataset);
	}
	
	@Override
	public double predict(double[] fueatures){
		return model.predict(Vectors.dense(fueatures));
	}
}
