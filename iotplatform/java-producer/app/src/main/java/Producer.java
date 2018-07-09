import com.google.gson.Gson;
import org.apache.http.client.fluent.Content;
import org.apache.http.client.fluent.Request;
import org.apache.http.entity.ContentType;

public class Producer {
    public static void main(String args[]) {
        Gson gson = new Gson();

        while(true) {
            try {
                String message = gson.toJson(generateEvent());

                Content response = Request.Post(args[0])
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
        public Double value;
    }

    private static SensorEvent generateEvent() {
        SensorEvent evt = new SensorEvent();
        evt.sensor_id = 192837465;
        evt.timestamp = System.currentTimeMillis();
        evt.value = Math.random() * 100;
        return evt;
    }
}
