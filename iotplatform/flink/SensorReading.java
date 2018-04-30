/*
 * Copyright 2015 data Artisans GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import java.text.SimpleDateFormat;
import java.util.Date;

import static java.util.Objects.requireNonNull;

/**
 * An individual sensor reading, describing sensor id, sensor group id, reading, and timestamp.
 */
public class SensorReading {
    private String sensorGroup;
    private String sensorId;
    private double reading;
    private long timestamp;

    public SensorReading() {
        this("", "", 0L, 0.0);
    }

    public SensorReading(String sensorGroup, String sensorId, long timestamp, double reading) {
        this.sensorGroup = requireNonNull(sensorGroup);
        this.sensorId = requireNonNull(sensorId);
        this.timestamp = timestamp;
        this.reading = reading;
    }

    public String sensorGroup() {
        return sensorGroup;
    }

    public String sensorId() {
        return sensorId;
    }

    public long timestamp() {
        return timestamp;
    }

    public String date() {
      SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
      String date = format.format(new Date(timestamp));
      return date;
    }

    public double reading() {
        return reading;
    }

    @Override
    public String toString() {
        SimpleDateFormat format = new SimpleDateFormat("HH:mm:ss.SSS yy-MM-dd");
        String date = format.format(new Date(timestamp));

        return '(' + sensorId + '/' + sensorGroup + ") @ " + date + " : " + reading;
    }
}
