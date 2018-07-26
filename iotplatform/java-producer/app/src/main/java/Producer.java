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

    private static final String PUBLIC_KEY = ".keys/jwtRS256.key.pub";
    private static final String PRIVATE_KEY_PKCS8 = ".keys/pkcs8_key";
    private static final int DEVICE_ID = 1;
    private static final String SENSOR_ID = "12345";

    public static RSAPublicKey readPublicKey(InputStream inputStream) throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
        String content = new String(ByteStreams.toByteArray(inputStream));

        byte[] keyBytes = Base64.getDecoder().decode(content.replaceAll("\\n", "").replaceAll("\\r", "").replace("-----BEGIN PUBLIC KEY-----", "").replace("-----END PUBLIC KEY-----", ""));

        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return (RSAPublicKey) kf.generatePublic(spec);
    }

    public static RSAPrivateKey readPrivateKey(InputStream inputStream) throws NoSuchAlgorithmException, IOException, InvalidKeySpecException {
        byte[] keyBytes = ByteStreams.toByteArray(inputStream);

        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return (RSAPrivateKey) kf.generatePrivate(spec);
    }

    public static void main(String args[]) throws NoSuchAlgorithmException, IOException, InvalidKeySpecException {
        RSAPublicKey publicKey = readPublicKey(Producer.class.getClassLoader().getResourceAsStream(PUBLIC_KEY));
        RSAPrivateKey privateKey = readPrivateKey(Producer.class.getClassLoader().getResourceAsStream(PRIVATE_KEY_PKCS8));

        Algorithm algorithm = Algorithm.RSA256(publicKey, privateKey);
        String token = JWT.create()
            .withClaim("iis", "iotplatform")
            .withClaim("sub", DEVICE_ID)
            .sign(algorithm);

        Gson gson = new Gson();

        while(true) {
            try {
                String message = gson.toJson(generateEvents(5));

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

    private static SensorEvent generateEvent() {
        SensorEvent evt = new SensorEvent();
        evt.sensor_id = SENSOR_ID;
        evt.timestamp = System.nanoTime();
        evt.value = String.valueOf(Math.random() * 100);
        return evt;
    }

    private static SensorEvent[] generateEvents(int numOfEvents) {
        SensorEvent[] evts = new SensorEvent[numOfEvents];

        for (int i = 0; i < evts.length; i++) {
            evts[i] = generateEvent();
        }

        return evts;
    }
}
