import ZingJS from "zingjs";

const app = new ZingJS({
  enableCors: true,
  enableRateLimit: false,
  enableLogging: true,
  serveStatic: true,
  enableDocs: true,
});


// Middleware
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});


// Custom event
app.on('customEvent', (data) => {
  console.log('Received event:', data);
});


app.emit('customEvent', { message: 'Hello from ZingJS!' });


app.listen(3000, () => console.log("Server running on http://localhost:3000"));
