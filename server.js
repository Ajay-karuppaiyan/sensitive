const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const db = require('./config/db');
const cors = require('cors');
// const fetch = require('node-fetch'); 
const adminRoute =require('./routes/adminRoute')
const projectRouter = require('./routes/projectRoute')
const taskRouter = require('./routes/taskRoute')
const verificationRoutes = require("./routes/verificationRoutes")
const clientRoutes = require('./routes/clientRoutes')
const leaveRoutes = require('./routes/leaveRoutes')
const attendanceRoutes = require('./routes/attendanceRoutes')
const superadminRouter = require('./routes/superadminRoutes');
const leadRoutes = require('./routes/leadRoute');
const payrollRoutes = require('./routes/payrollRoute');
const updateLogRoutes = require('./routes/updatelogRoute');
const paymentRoutes =  require('./routes/paymentRoute');
const expenseRoutes =  require('./routes/expenseRoute');
const momRoutes =  require('./routes/momRoute');
const quotationRoutes =  require('./routes/quotationRoute');
const placesRoutes = require('./routes/placesRoutes');
const placeDetailsRoute = require("./routes/placeDetailsRoute");
const emailOTP = require("./routes/emailotpRoute")

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.use('/', attendanceRoutes);
app.use('/clients', clientRoutes);
app.use('/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/leads', leadRoutes);
app.use('/payroll',payrollRoutes);
app.use('/updatelog',updateLogRoutes);
app.use('/payments', paymentRoutes);
app.use('/expense', expenseRoutes);
app.use('/mom', momRoutes);
app.use('/quotation', quotationRoutes);
app.use('/api', placesRoutes);
app.use("/api/place-details", placeDetailsRoute);




db(); 
app.use('/', adminRoute);
app.use('/project', projectRouter)
app.use('/task', taskRouter)
app.use('/employee-login',verificationRoutes);
app.use('/super-admin', superadminRouter)
app.use('/admin-login',verificationRoutes);
app.use('/email',emailOTP);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
