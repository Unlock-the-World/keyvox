package main.java.api.utils;

import java.io.IOException;
import java.security.MessageDigest;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TimeZone;

import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.apache.http.HttpStatus;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.map.ObjectMapper;

public class HttpUtils {
	private static final String UTF_8 = "UTF-8";
	private static final String HMAC_SHA256 = "HmacSHA256";
	
	/** Object To Json*/
	public static String toJson(Object obj) {
		String str = "";
		ObjectMapper objectMapper = new ObjectMapper();
		try {
			str = objectMapper.writeValueAsString(obj);
		} catch (JsonProcessingException e) {
			System.err.println(String.format("Object To Json Error, JsonProcessingException = {%s}",e.getMessage()));
		} catch (IOException e) {
			e.printStackTrace();
			System.err.println(String.format("Object To Json Error, IOException = {%s}",e.getMessage()));
		}
		return str;
	}
	
	/***
	 * @param url        
	 * @param headerMap  
	 * @param paramMap   
	 * @param host       host(default.pms)
	 * @param key        apiKey
	 * @param secret     
	 * @return
	 */
	public static String invoke(String url, Map<String, Object> headerMap, Map<String, Object> paramMap, String host, String key, String secret) {
		
		String postParam = toJson(paramMap);
		
		//System.err.println(String.format("Request={\n url={%s},\n pmsHost={%s},\n pmsKey={%s},\n pmsSecret={%s}\n}", url, host, key, secret));
		// 0.1 get path(remove domain)
		int pos = url.indexOf("//");
		if (pos < 0) {
			pos = url.indexOf("/");
		} else {
			pos = url.indexOf("/", pos + 2);
		}
		if (pos < 0) {
			throw new RuntimeException("invalid url. url: " + url);
		}
		String requestUri = url.substring(pos);
		// 0.2 param(headerMap)
		if (headerMap == null) {
			headerMap = new HashMap<String, Object>();
		}
		// 0.3 postParam
		if (postParam == null) {
			postParam = "";
		}
		// 0.4 chech key and secret
		if ((key == null) || (key.length() == 0) || (secret == null) || (secret.length() == 0)) {
			throw new RuntimeException("invalid key or secret.");
		}

		// 1. headers: "date request-line digest"
		// 1.1 date
		String dateStr = dateToString(new Date());
		// 1.2 request-line
		String requestLine = "POST " + requestUri + " HTTP/1.1";
		// 1.3 digest
		String digest = "SHA-256=" + new String(Base64.getEncoder().encode(encodeSHA256(postParam)));

		// 2.1 edit message
		StringBuffer sb = new StringBuffer();
		sb.append("date: ").append(dateStr); // date
		sb.append("\n").append(requestLine); // request-line
		sb.append("\n").append("digest: ").append(digest); // digest
		String msg = sb.toString();
		
		// 2.2 get signature
		String signature = new String(Base64.getEncoder().encode(toHmacSha(HMAC_SHA256, secret, msg)));
		System.err.println("hello signature：");
		System.err.println(signature);
		
		// 3. authorization
		String authorization = String.format("hmac username=\"%s\", algorithm=\"hmac-sha256\", headers=\"date request-line digest\", signature=\"%s\"", key, signature);

		// 4. header
		headerMap.put("date", dateStr);
		headerMap.put("digest", digest);
		headerMap.put("authorization", authorization);
		if ((host != null) && (host.length() > 0)) {
			headerMap.put("x-target-host", host);
		}

		/*
		POST 'https://eco.blockchainlock.io/api/eagle-pms/v1/getUnits' \
		--header 'date: Thu, 08 Oct 2020 12:55:36 GMT' \
		--header 'authorization: hmac username="0QLYByXXXXXXXXXXXXXXXX", algorithm="hmac-sha256", headers="date request-line digest", signature="XblxsAAPjpyiGXXXXXXXXXXXXXXXk="' \
		--header 'x-target-host: default.pms' \
		--header 'digest: SHA-256=RBNvXXXXXXXXXXXXXXX4o=' \
		--header 'Content-Type: application/json' \
		--data-raw '{}'
		*/

		return doPost(url, headerMap, postParam);
	}

	private static String dateToString(Date date) {
		DateFormat dateFormat = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'", Locale.US);
		dateFormat.setTimeZone(TimeZone.getTimeZone("GMT"));
		return dateFormat.format(date);
	}
	
	private static byte[] toHmacSha(String algorithm, String encryptKey, String encryptText) {
        try {
            byte[] data = encryptKey.getBytes(UTF_8);
            SecretKey secretKey = new SecretKeySpec(data, algorithm);
            Mac mac = Mac.getInstance(algorithm);
            mac.init(secretKey);
            byte[] text = encryptText.getBytes(UTF_8);
            return mac.doFinal(text);
        } catch(Exception ex) {
            throw new RuntimeException(ex);
        }
    }
	
	private static byte[] encodeSHA256(String str) {
		if (str == null) {
			return null;
		}
		try {
			MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
			messageDigest.update(str.getBytes(UTF_8));
			return messageDigest.digest();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	public static String doPost(String url, Map<String, Object> headerMap, String postParam) {
		CloseableHttpClient httpclient = HttpClients.createDefault();
		HttpPost httpPost = new HttpPost(url);
		if (headerMap!=null&&headerMap.size()>0) {
			Iterator<Entry<String, Object>> itr = headerMap.entrySet().iterator();
			System.err.println("******all header begin******");
			while (itr.hasNext()) {
				Entry<String, Object> kv = itr.next();
				httpPost.setHeader(kv.getKey(), kv.getValue().toString());
				//Headers出力
				System.err.println("key:" + kv.getKey() + " value:" + kv.getValue().toString());
			}
			System.err.println("******all header end******");
		}
		if(postParam!=null&&postParam.length()>0) {
			StringEntity s = new StringEntity(postParam, "utf-8");
			s.setContentEncoding("UTF-8");
			s.setContentType("application/json");
			httpPost.setEntity(s);
		}
		CloseableHttpResponse response = null;

		
		try {
			response = httpclient.execute(httpPost);
			if (response.getStatusLine().getStatusCode() == HttpStatus.SC_OK || response.getStatusLine().getStatusCode() == HttpStatus.SC_FORBIDDEN) {// 403 is have no Authority to access
				String resp = EntityUtils.toString(response.getEntity(), "UTF-8");
				return  resp;
			} else {
				return new String("{\"code\":\"999\",\"msg\":\""+"response status code:" + response.getStatusLine().getStatusCode()+"\"}");
			}
		} catch (Exception e) {
			e.printStackTrace();
			return new String("{\"code\":\"999\",\"msg\":\""+e.getMessage()+"\"}");
		} finally {
			if (response != null) {
				try {
					response.close();
				} catch (IOException e) {
					return new String("{\"code\":\"999\",\"msg\":\""+e.getMessage()+"\"}");
				}
				if (httpclient != null) {
					try {
						httpclient.close();
					} catch (IOException e) {
						return new String("{\"code\":\"999\",\"msg\":\""+e.getMessage()+"\"}");
					}
				}
			}
		}
	}
}
