package dataAnalytics.algorithms;

import constants.AlgorithmName;

public class AlgorithmFactory {
	
	/**
	 * Given a valid algorithm name, this methid instantiated the corresponding algorithm to be used
	 * @param algName
	 * @return
	 */
	public AlgorithmInterface getAlgorithm(String algName) throws Exception{
		
		AlgorithmInterface alg = null;
		
		switch(AlgorithmName.valueOf(algName)){
		
		case LINEAR_REGRESSION:
			alg = new LinearRegressionAlgorithm();
			break;
		default:
			throw new Exception("Invalid algorithm name received: algName");
		}
		
		return alg;
	}
}
