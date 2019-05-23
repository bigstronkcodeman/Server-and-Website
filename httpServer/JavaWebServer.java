package httpServer;

import java.io.*;
import java.util.*;
import java.net.*;

public class JavaWebServer implements Runnable
{

	static final File ROOT_DIRECTORY = new File("C:\\Users\\boudr\\eclipse-workspace\\httpServer\\src\\httpServer\\public_html");
	static final int PORT = 8081;
	static final boolean DEBUG = true;
	
	private Socket connectSocket;
	
	public JavaWebServer(Socket s)
	{
		connectSocket = s;
	}
	
	public static void main(String args[])
	{
		ServerSocket serverConnect = null;
		try
		{
			serverConnect = new ServerSocket(PORT);
			System.out.println("Server started.\nListening for requests on port " + PORT + " ...\n");
			
			while (true)
			{
				JavaWebServer server = new JavaWebServer(serverConnect.accept());
				
				if (DEBUG)
				{
					System.out.println("Connection opened (" + new Date() + ")");
				}
				
				Thread thread = new Thread(server);
				thread.start();
			}
		}
		catch (IOException e)
		{
			System.err.println("Server connection error: " + e.getMessage());
		}
		finally
		{
			if (serverConnect != null && !serverConnect.isClosed())
			{
				try 
				{
					serverConnect.close();
				}
				catch (IOException ioe)
				{
					System.out.println("Error closing server socket: " + ioe.getMessage());
				}
			}
		}
	}
	
	@Override
	public void run()
	{
		BufferedReader in = null;
		PrintWriter out = null;
		BufferedOutputStream dout = null;
		String requestedFile = null;
		
		try
		{
			in = new BufferedReader(new InputStreamReader(connectSocket.getInputStream()));
			out = new PrintWriter(connectSocket.getOutputStream());
			dout = new BufferedOutputStream(connectSocket.getOutputStream());
			
			String input = null;
			StringTokenizer parser = null;
			String method = null;
			try
			{
				input = in.readLine();
				parser = new StringTokenizer(input);
				method = parser.nextToken().toUpperCase();
				requestedFile = parser.nextToken().toLowerCase();
			}
			catch (NullPointerException npe)
			{
				System.out.println("Error reading data from socket input stream: " + npe.getMessage());
			}
			
			
			if (method.equals("GET") || method.equals("HEAD"))
			{
				if (requestedFile.endsWith("/"))
				{
					requestedFile += "index.html";
				}
				
				File file = new File(ROOT_DIRECTORY, requestedFile);
				int fileLength = (int)file.length();
				String contentType = getContentType(requestedFile);
				
				if (method.equals("GET"))
				{
					byte[] fileData = getFileData(file, fileLength);
					
					out.println("HTTP/1.1 200 OK");
					out.println("Server: Phil's Java HTTP Web Server 1.0");
					out.println("Date: " + new Date());
					out.println("Content type: " + contentType);
					out.println("Content length: " + fileLength);
					out.println();
					out.flush();
					
					dout.write(fileData, 0, fileLength);
					dout.flush();
				}
				
				if (DEBUG)
				{
					System.out.println("File " + requestedFile + " (type " + contentType + ") returned");
				}
			}
			else
			{
				if (DEBUG)
				{
					System.out.println("method " + method + " not implemented server-side");
				}
				
				File file = new File(ROOT_DIRECTORY, "not_supported.html");
				int fileLength = (int)file.length();
				String contentMimeType = "text/html";
				byte[] fileData = getFileData(file, fileLength);
				
				out.println("HTTP/1.1 501 method not implemented");
				out.println("Server: Phil's Java HTTP Web Server 1.0");
				out.println("Date: " + new Date());
				out.println("Content type: " + contentMimeType);
				out.println("Content length: " + fileLength);
				out.println();
				out.flush();
				
				dout.write(fileData, 0, fileLength);
				dout.flush();
			}
		}
		catch (FileNotFoundException fnfe)
		{
			fileNotFound(out, dout, requestedFile);
			
		}
		catch (IOException ioe)
		{
			System.err.println("Server error: " + ioe.getMessage());
		}
		finally
		{
			try
			{
				in.close();
				out.close();
				dout.close();
				connectSocket.close();
			}
			catch (Exception e)
			{
				System.err.println("Error closing stream: " + e.getMessage());
			}
			
			if (DEBUG)
			{
				System.out.println("Connection closed.\n");
			}
		}
	}
	
	private byte[] getFileData(File file, int fileLength)
	{
		FileInputStream fis = null;
		byte[] fileData = new byte[fileLength];
		
		try
		{
			fis = new FileInputStream(file);
			fis.read(fileData);
		}
		catch (IOException ioe)
		{
			System.out.println("Error getting file data: " + ioe.getMessage());
		}
		finally
		{
			if (fis != null)
			{
				try
				{
					fis.close();
				}
				catch (IOException ioe)
				{
					System.out.println("Error closing file: " + ioe.getMessage());
				}
			}
		}
		
		return fileData;
	}
	
	private String getContentType(String requestedFile)
	{
		if (requestedFile.endsWith(".htm") || requestedFile.endsWith(".html"))
		{
			return "text/html";
		}
		else if (requestedFile.endsWith(".js"))
		{
			return "text/javascript";
		}
		else if (requestedFile.endsWith(".css"))
		{
			return "text/css";
		}
		else
		{
			return "text/plain";
		}
	}
	
	private void fileNotFound(PrintWriter out, OutputStream dout, String requestedFile)
	{
		File file = new File(ROOT_DIRECTORY, "404.html");
		int fileLength = (int)file.length();
		String contentType = "text/html";
		byte[] fileData = getFileData(file, fileLength);
		
		out.println("HTTP/1.1 404 File Not Found");
		out.println("Server: Phil's Java HTTP Web Server 1.0");
		out.println("Date: " + new Date());
		out.println("Content type: " + contentType);
		out.println("Content length: " + fileLength);
		out.println();
		out.flush();
		
		try
		{
			dout.write(fileData, 0, fileLength);
			dout.flush();
		}
		catch (IOException ioe)
		{
			System.out.println("Error writing to output stream: " + ioe.getMessage());
		}
		
		if (DEBUG)
		{
			System.out.println("File " + requestedFile + " not found");
		}
	}
}
