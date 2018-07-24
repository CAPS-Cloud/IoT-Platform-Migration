import org.apache.flink.api.common.serialization.AbstractDeserializationSchema;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.node.ArrayNode;

import java.io.IOException;

public class ArrayNodeDeserializationSchema extends AbstractDeserializationSchema<ArrayNode> {
    private ObjectMapper mapper;

    @Override
    public ArrayNode deserialize(byte[] message) throws IOException {
        if (mapper == null) {
            mapper = new ObjectMapper();
        }
        return mapper.readValue(message, ArrayNode.class);
    }
}