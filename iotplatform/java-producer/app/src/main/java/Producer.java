import com.google.gson.Gson;
import org.apache.http.client.fluent.Content;
import org.apache.http.client.fluent.Request;
import org.apache.http.entity.ContentType;

public class Producer {

    private static String TEST_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpb3RwbGF0Zm9ybSIsInN1YiI6IjEyMzQ1IiwibmJmIjoxNTMxMTMyODA4LCJleHAiOjE1NjI2Njg4MDgsImlhdCI6MTUzMTEzMjgwOCwianRpIjoiaWQxMjM0NTYiLCJ0eXAiOiJodHRwczovL2lvdHBsYXRmb3JtLmNvbSJ9.dZoOJcfI2bd32FJtQoTtMt7AxlklFFbzmPdJQ3Q08JSvn82y4eje1MGFOQDa76HfyOUuvhxiw6kzxpH2i5bSP-KrJ-TsXfrlgY0YxX2SqNFVm7ArzYtH3auHpht8q3ZfNch3RbnDHDv2VyUNFeoYOWjBtveGQgk5I9Ox_bbYZ5EuBakTlahuv_PG3OSkq59626Usvzqo77XyWYPuHcsxTa-m3DBSBHufF95sbtDemjxQP5NhYkE_OM6ZZmRItxHEJqBVDEG9JI64ECnwi6XNcq3nk_CzJNXbEnivN42vIPzdodzDECsJr2say9hOJhvpAQMCdh3SYwN063rPMjf9aMIXYmilxh0y0uCo8w2E8RxoRw51gbDlDZiq3D1LXlAL2h6-3Zm21_ip1kKSzaT6DdYsjssns1ofl6xRY5bVZbEi9oNO7WxgWVCnSHQ2Xim8TsXCPvAczsiLehHCW-ZC6xHvU7yZ0n6QLC3Oo4VTA7gAR9R1B4tIpwKcuc6fo0hqZ24lUwtpcnahmC6CBv-WPQ07pED677PguqEk_NVXL6LAZHFcI9fFeQX7ubWAXwjGyv7xKnA88453k6ylczb6KuHGvc9FY351CRiBXDxu0wnl9j9lAJaTs7Mb-52A5UuANUhbaXgAD1uMhIA3xtJJ3wL_yq8LTurSHVOEAS9xFl8";



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
