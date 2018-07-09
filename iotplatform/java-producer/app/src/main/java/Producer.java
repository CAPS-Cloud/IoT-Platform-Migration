import com.google.gson.Gson;
import org.apache.http.client.fluent.Content;
import org.apache.http.client.fluent.Request;
import org.apache.http.entity.ContentType;

public class Producer {

    private static String TEST_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2p3dC1pZHAuZXhhbXBsZS5jb20iLCJzdWIiOiJtYWlsdG86bWlrZUBleGFtcGxlLmNvbSIsIm5iZiI6MTUzMTEyOTQ5MywiZXhwIjoxNTMxMTMzMDkzLCJpYXQiOjE1MzExMjk0OTMsImp0aSI6ImlkMTIzNDU2IiwidHlwIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9yZWdpc3RlciJ9.vAqqUsrEA9SzHm8BF7n7Lc_d77oyfEieiMOomEgWpAbtBmv2xs44hSV8Lip71Fkx8ApO7G6CwwvtvnYqdNhNbYyVU4Elf-k4JG4LObFE4sYpYHQQCJZ1ABZ24qcoOr1S9AEkJG912ZPtHejpWBMXaGNA-SZ3yeTe5Whkqm4z0ovz1KrNM1Bv33CdlGfvCpAPk52gY7-A_4V6SOSTINTPKrvhRzPprIk36FyrTZCUi2xDNv9rSvdUlZe-9NuDTecuW3toqXStZPFGU8q3PrO_UrKF6LQgqXl-gxy25Tbxmm_xTOHhPgXJN40II_4Abnq6QkM7GNQhsBmxVh5IlCM_YXFAP2oCHIVBNK8Y5SrKKKf_O8GhpaSH77zwYPhKItB7Xu7seejapyUiwHYZbR6azBseQUXcNUg5_j2wbGBvvVYJ37ZvUaYDLxptPa7JFs2p9ukbdLfbvUU7l0w9cGouIqdxGJM7mSZTmcAZrE_AT5wfiY95CuVej-ILY30oTcU9RbVMM6loRNYeLpRqGzVcZcTvGPh0eW07KyfhJM25tFiquP65Wl0-gOyh2_d6KM1w0Ae0yiPkOpMhkSvVN9wakO7WlLn6Y8opC61jkgRX4BifKHdjOtSNtlyOjAWjBpwB68rQYM7Tq0sXJmEl-KVm2tQeynzjPdiLMGuICmfZnzY";

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
