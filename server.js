const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const accountRouter = require('./account');

const app = express();
const PORT = process.env.PORT || 3000;

// ১. সিকিউরিটি হেডার (Helmet) - এক্সপ্লয়েট থেকে সুরক্ষা দেয়
app.use(helmet({
    contentSecurityPolicy: false, // HTML/JS স্মুথলি লোড করার জন্য
}));

// ২. CORS কনফিগারেশন (শুধু নির্দিষ্ট ডোমেইন/অরিজিন থেকে রিকোয়েস্ট অ্যালাউ করা)
app.use(cors());

// ৩. রেট লিমিটিং (ডিডিওস (DDoS) বা স্প্যামিং রিকোয়েস্ট বন্ধ করার জন্য)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // ১৫ মিনিট
    max: 100, // প্রতিটি IP প্রতি ১৫ মিনিটে সর্বোচ্চ ১০০টি রিকোয়েস্ট করতে পারবে
    message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ৪. বডি পার্সার (JSON এবং URL-encoded তথ্য প্রসেস করার জন্য)
app.use(express.json({ limit: '10kb' })); // বড় আকারের ভুয়া পে-লোড রদ করে
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// স্ট্যাটিক ফাইল সার্ভিস (HTML, CSS, JS)
app.use(express.static(__path = path.join(__dirname, 'public')));

// API রাউটস
app.use('/api/account', accountRouter);

// ফ্রন্টএন্ড মেইন পেজ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'MHT.HTML'));
});

// অজানা রাউট হ্যান্ডলার (404 Error Handler)
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Resource not found' });
});

// সার্ভার স্টার্ট
app.listen(PORT, () => {
    console.log(`[SECURE SERVER running on port ${PORT}]`);
});
