import java.util.Properties;

import javax.mail.Message;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;


import com.sun.mail.util.MailSSLSocketFactory;

import static java.lang.System.currentTimeMillis;

public class MailSender {

    public static long timeDelta;

    public void sendEmail(String toEmail, double value, String name, long time, long Kafkatime){

        try{
            MailSSLSocketFactory socketFactory= new MailSSLSocketFactory();
            socketFactory.setTrustAllHosts(true);

            String host = "smtp.gmail.com";
            String from = "iotplatform2019@gmail.com";
            String to = toEmail;
            String pass = "wttjalrmksgtuwph";
            Properties props = System.getProperties();
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.host", host);
            props.put("mail.smtp.user", from);
            props.put("mail.smtp.password", pass);
            props.put("mail.smtp.port", "587");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.ssl.socketFactory", socketFactory);

            Session session = Session.getDefaultInstance(props, null);
            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress(from));
            message.addRecipient(Message.RecipientType.TO, new InternetAddress(to));
            timeDelta = currentTimeMillis();
            message.setSubject("[Alert] From IOT System Alert Name :" + name);
            message.setText("Sensor encountered an unexpected value :"+ value + " Time Delta: "+ timeDelta + " - " + time + " - " + Kafkatime);
            Transport transport = session.getTransport("smtp");
            transport.connect(host, from, pass);
            transport.sendMessage(message, message.getAllRecipients());
            transport.close();
        }
        catch(Exception e){
            e.printStackTrace();
        }
    }
}
