// instrumentation.ts  
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'  
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'  
import { logs } from '@opentelemetry/api-logs'

export async function register() {  
 if (process.env.NEXT_RUNTIME === 'nodejs') {  
 const exporter = new OTLPLogExporter({  
 url: 'https://us.i.posthog.com/i/v1/logs',  
 headers: {  
 Authorization: 'Bearer YOUR_PHC_TOKEN_HERE',  
 },  
 })

 const loggerProvider = new LoggerProvider()

 loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(exporter))  
 logs.setGlobalLoggerProvider(loggerProvider)

 ;(globalThis as any).__posthogLogger = loggerProvider.getLogger('my-nextjs-app')  
 }  
}  