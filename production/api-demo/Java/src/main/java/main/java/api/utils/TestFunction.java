package main.java.api.utils;

import java.lang.reflect.Method;
import java.util.HashMap;

public class TestFunction{

	
	//　本番用
	private static final String baseurl = "https://eco.blockchainlock.io/api/eagle-pms/v1";
	
	private static final String host = "default.pms";
	//　お客様用APIキー
	private static final String apikey = "";
	private static final String secret = "";
	
	private static void sendPost(String api,HashMap<String,Object> param) {
		String url = new StringBuffer(baseurl).append(api).toString();
		String resp = HttpUtils.invoke(url, null, param, host, apikey, secret);
		StringBuffer sb = new StringBuffer();
		sb.append("\n#########################").append(api).append(" start #########################\n");
		sb.append("\nreqBody  = ").append(param).append("\n");
		sb.append("\nrespBody  = ").append(resp).append("\n");
		sb.append("\n#########################").append(api).append(" end   #########################\n");
		System.err.println(sb);
	}
	
	public static void main(String[] args) {
		try {
			Method[] ms = TestFunction.class.getDeclaredMethods();
			for(Method m:ms) {
				if(m.getName().startsWith("test")) {
					m.invoke(m.getClass());
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			System.exit(0);
		}
	}
	
	public static void testGetUnitsin() {
		HashMap<String,Object> p = new HashMap<String,Object>();
		sendPost("/getUnits", p);
	}
	
	public static void testCreateLockPin() {
		HashMap<String,Object> p = new HashMap<String,Object>();
		p.put("unitId", "5dc02d9557a9445018f12998");
		p.put("pinCode", "123456");
		p.put("pinType", "1");
		p.put("sTime", "1555411723");
		p.put("eTime", "1555498123");
		sendPost("/createLockPin", p);
	}
	
	public static void testChangeLockPin() {
		HashMap<String,Object> p = new HashMap<String,Object>();
		p.put("pinId", "5cbd3a4657a9440a40653d46");
		p.put("pinCode", "123456");
		p.put("sTime", "1555411723");
		p.put("eTime", "1569921568");
		sendPost("/changeLockPin", p);
	}
	
	public static void testDisableLockPin() {
		HashMap<String,Object> p = new HashMap<String,Object>();
		p.put("pinId", "5cbd3a4657a9440a40653d46");
		sendPost("/disableLockPin", p);
	}
	
	
	public static void testGetLockPinStatus() {
		HashMap<String,Object> p = new HashMap<String,Object>();
		p.put("pinId", "5cf71a164cda060dbd8be3da");
		sendPost("/getLockPinStatus", p);
	}
	
	public static void testGetLockStatus() {
		HashMap<String,Object> p = new HashMap<String,Object>();
		p.put("lockId", "408BFBDAB28D5382");
		sendPost("/getLockStatus", p);
	}
	
	public static void testGetLockHistory() {
		HashMap<String,Object> p = new HashMap<String,Object>();
		p.put("lockId", "C11A1FCD10000162");
		p.put("position", "");
		p.put("records", "5");
		sendPost("/getLockHistory", p);
	}
	
	public static void testAddCard() {
		HashMap<String,Object> p = new HashMap<String,Object>();
		p.put("cardCode", "1234567890");
		p.put("cardName", "wang");
		p.put("cardDesc", "wang test");
		sendPost("/card/add", p);
    }
	
	public static void testDelCard() {
		HashMap<String,Object> p = new HashMap<String,Object>();
		List<String> cardList = new ArrayList<String>();
		cardList.add("610112d359f874472a51ed47");
		p.put("cardList", cardList);
		sendPost("/card/delCardList", p);
    }
}
