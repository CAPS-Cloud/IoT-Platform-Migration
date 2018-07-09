import com.google.gson.Gson;
import org.apache.http.client.fluent.Content;
import org.apache.http.client.fluent.Request;
import org.apache.http.entity.ContentType;

public class Producer {

    private static String TEST_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpb3RwYXRmb3JtIiwic3ViIjoiMTIzNDUiLCJuYmYiOjE1MzExMzA5MjEsImV4cCI6MTU2MjY2NjkyMSwiaWF0IjoxNTMxMTMwOTIxLCJqdGkiOiJpZDEyMzQ1NiIsInR5cCI6Imh0dHBzOi8vaW90cGxhdGZvcm0uY29tIn0.EQH82SUHBtcdXGkcHqEXmxL2tkpozSsk9l1WFRBRmRLC903CMixY8CMUzGQ0biSZ4BgEHhAZsUdVeRibjqlWaGU10jkLW5OhjmbWpVewsoKcelobjgaRzFhec9HRy2NRK1ZpAoj2t7Ph7KiH9icLo0LctGPo5lbn3nhQXvNn27toIcYj3AFWswBXN6eSxSjHpN6QpwjXd2Ld_YPqGYU854g63487tsf-7PSfj7JcIhW9FN6qmetFPNERJ2JhCC52fBL9n2wp7jThsShWi3_8i-PwYyaDFD_9twntymoXbFSOsh2R__62wPX08WeXNIVMoapEB8tAHUjayI6CSPljdGd4413oyx0KsW48Ng52iMMScB8tbZPNqDdMlpHcd9Rs4zGvNSrNJ7BbvCfcn8eVyndUX9AYImRI5ZdXiraHx5yO5oPOHtM_6_0xFOKdbWEhbL6a-MhGoRk8fflc29usQtaFqJOSKZP0d_vH49ZgeP36bqI6F0-a8n9MkAJWjGRtSPmknkh7szhObZWbHDzk7xd4-63YXctdJKYdWlZT9YAvoOM0PAMeubnNxzaMtKKfciVt3SlZmUFynDVxBFeEinJ7nzchjwwqdimwgTIwIeNffWvvqH3Vo65odS6vsf8C5pGLEaW7hnuaOobyGqp4vEZ96iMchWm3X0_7xmjtCfM";



    public static void main(String args[]) {
        Gson gson = new Gson();

        while(true) {
            try {
                String message = gson.toJson(generateEvent());

                Content response = Request.Post(args[0])
                        .addHeader("Authorization", "Bearer " + TEST_TOKEN)
                        .bodyString(message,ContentType.APPLICATION_JSON)
                        .execute().returnContent();
                //System.out.println(response.asString());
            } catch(Exception e) {
                System.err.println(e);
            }
            try {
                Thread.sleep(1000);
            } catch(InterruptedException e) {
                e.printStackTrace();
            }
        }

    }

    private static class SensorEvent {
        public long sensor_id;
        public long timestamp;
        public String value;
    }

    private static SensorEvent generateEvent() {
        SensorEvent evt = new SensorEvent();
        evt.sensor_id = 192837465;
        evt.timestamp = System.currentTimeMillis();
        evt.value = String.valueOf(Math.random() * 100);
        return evt;
    }
}
