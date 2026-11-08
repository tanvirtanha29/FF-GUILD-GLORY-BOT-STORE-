const express = require('express');
const router = express.Router();

// ইনপুট ক্লিন করার ফাংশন (XSS এবং ইনজেকশন প্রতিরোধে)
function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[^\w\s-]/gi, '').trim();
}

// ১. বট স্ট্যাটাস দেখার API Endpoint
router.get('/status', (req, res) => {
    res.json({
        success: true,
        botActive: true,
        gloryRate: '100% Guaranteed',
        availableBots: 5
    });
});

// ২. Free Fire API থেকে শুধু Guild Name এবং Level চেক করার API
router.get('/check-guild', async (req, res) => {
    try {
        const { uid } = req.query;
        const cleanUid = sanitizeInput(uid);

        if (!cleanUid) {
            return res.status(400).json({
                success: false,
                message: 'দয়া করে সঠিক Player UID দিন'
            });
        }

        // আপনার দেওয়া এক্সটার্নাল API কল করা হচ্ছে
        const apiResponse = await fetch(`https://auraffxserverinfocheckerapi.onrender.com/api/player?uid=${cleanUid}`);
        const data = await apiResponse.json();

        // API রেসপন্স থেকে শুধুমাত্র গিল্ডের নাম এবং লেভেল ফিল্টার করা
        // (একাধিক সম্ভাব্য স্ট্রাকচারের জন্য সেইফ চেক রাখা হয়েছে)
        const guildName = data?.guildName || data?.GuildName || data?.guild?.name || data?.basicInfo?.guildName || data?.clanName || 'গিল্ড পাওয়া যায়নি';
        const guildLevel = data?.guildLevel || data?.GuildLevel || data?.guild?.level || data?.basicInfo?.guildLevel || data?.clanLevel || 'N/A';

        return res.json({
            success: true,
            guildInfo: {
                name: guildName,
                level: guildLevel
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'সার্ভার বা API কানেকশনে সমস্যা হয়েছে'
        });
    }
});

// ৩. গিল্ড গ্লোরি অর্ডার প্রসেস করার API
router.post('/buy-glory', (req, res) => {
    try {
        const { playerUid, guildId, packageId } = req.body;

        const cleanUid = sanitizeInput(playerUid);
        const cleanGuildId = sanitizeInput(guildId);

        if (!cleanUid || !cleanGuildId || !packageId) {
            return res.status(400).json({
                success: false,
                message: 'সবগুলো সঠিক তথ্য প্রদান করুন (UID & Guild ID mandatory)'
            });
        }

        return res.json({
            success: true,
            message: 'গিল্ড গ্লোরি অর্ডার সফলভাবে গ্রহণ করা হয়েছে!',
            orderDetails: {
                targetGuild: cleanGuildId,
                buyerUid: cleanUid,
                package: packageId,
                status: 'Processing'
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

module.exports = router;
