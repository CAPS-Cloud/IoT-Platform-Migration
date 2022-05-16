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
    private long timestamp;
    private String sensorId;
    private String deviceId;
    private Object value;

    public SensorReading() {
        this(0L, "", "", "");
    }

    public SensorReading(long timestamp, String sensorId, String deviceId, Object value) {
        long newTimeStamp;

        if(String.valueOf(timestamp).length() < 16) {
            newTimeStamp = timestamp * 1000;
        } else {
            newTimeStamp = timestamp;
        }

        this.timestamp = newTimeStamp;
        this.sensorId = requireNonNull(sensorId);
        this.deviceId = requireNonNull(deviceId);
        this.value = requireNonNull(value);
    }

    public long getTimestamp() {
        return timestamp;
    }

    public String getDate() {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
        String date = format.format(new Date(timestamp));
        return date;
    }

    public String getSensorId() {
        return sensorId;
    }
    public String getDeviceId() {
            return deviceId;
        }

    public Object getValue() {
        return value;
    }

    @Override
    public String toString() {
        SimpleDateFormat format = new SimpleDateFormat("HH:mm:ss.SSS yy-MM-dd");
        String date = format.format(new Date(timestamp));

        return '(' + this.sensorId + ") @ " + date + " : " + this.value;
    }
}
