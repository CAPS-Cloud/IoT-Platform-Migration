import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.google.common.io.ByteStreams;
import com.google.gson.Gson;
import org.apache.http.client.fluent.Content;
import org.apache.http.client.fluent.Request;
import org.apache.http.entity.ContentType;

import java.io.IOException;
import java.io.InputStream;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class Producer {
    public static void main(String args[]) throws NoSuchAlgorithmException, IOException, InvalidKeySpecException {
        Gson gson = new Gson();

        String token = args[4];
        String device_id = args[2];
        String sensor_id = args[3];
        String iotcore_backend = args[1];

        while(true) {
            try {
                String message = gson.toJson(generateEvents(3, sensor_id));

                Content response = Request.Post(args[0])
                    .addHeader("authorization", "Bearer " + token)
                    .bodyString(message,ContentType.APPLICATION_JSON)
                    .execute().returnContent();
                //System.out.println(response.asString());
            } catch(Exception e) {
                e.printStackTrace();
            }
            try {
                Thread.sleep(1000);
            } catch(InterruptedException e) {
                e.printStackTrace();
            }
        }

    }

    private static class SensorEvent {
        public String sensor_id;
        public long timestamp;
        public String value;
    }

    private static SensorEvent generateEvent(String sensor_id) {
        SensorEvent evt = new SensorEvent();
        evt.sensor_id = sensor_id;
        evt.timestamp = System.nanoTime();
        evt.value = String.valueOf(Math.random() * 100);
        return evt;
    }

    private static SensorEvent[] generateEvents(int numOfEvents, String sensor_id) {
        SensorEvent[] evts = new SensorEvent[numOfEvents];

        for (int i = 0; i < evts.length; i++) {
            evts[i] = generateEvent(sensor_id);
        }

        return evts;
    }
}
