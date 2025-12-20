const CropData = require('../models/CropData');
const Notification = require('../models/Notification');

const cropMap = {
    'tomato': 'Tomato', 'টমেটো': 'Tomato',
    'potato': 'Potato', 'আলু': 'Potato',
    'rice': 'Rice', 'ধান': 'Rice',
    'wheat': 'Wheat', 'গম': 'Wheat',
    'cotton': 'Cotton', 'তুলা': 'Cotton'
};

const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const lowerMessage = message.toLowerCase();
        const isBangla = /[\u0980-\u09FF]/.test(message);

        let response = '';

        // 1. Language Detection & Greetings
        if (lowerMessage.match(/\b(hi|hello|hey|hola|সালাম|নমস্কার|কেমন আছেন)\b/)) {
            response = isBangla
                ? "নমস্কার! আমি ক্রপবট (CropBot), আপনার কৃষি সহকারী। আমি আপনাকে সাহায্য করতে পারি:\n• রোগ শনাক্তকরণ\n• প্রতিকারের পরামর্শ\n• প্রতিরোধের উপায়\n• সাধারণ কৃষি বিষয়ক তথ্য\n\nআপনি কী জানতে চান?"
                : "Hello! I'm CropBot, your professional agricultural assistant. I provide data-driven insights for:\n• Disease identification\n• Scientific treatment protocols\n• Proactive prevention strategies\n• General agronomic advice\n\nHow can I assist your farm today?";
            return res.json({ response });
        }

        // 2. Identify Targeted Crop
        let targetCrop = null;
        for (const [key, val] of Object.entries(cropMap)) {
            if (lowerMessage.includes(key)) {
                targetCrop = val;
                break;
            }
        }

        // 3. Dynamic Disease/Treatment Queries
        if (targetCrop) {
            const cropData = await CropData.findOne({ cropName: targetCrop });

            if (cropData) {
                // Check if specific disease mentioned
                let matchedDisease = null;
                for (const disease of cropData.diseases) {
                    if (lowerMessage.includes(disease.name.toLowerCase())) {
                        matchedDisease = disease;
                        break;
                    }
                }

                if (matchedDisease) {
                    if (isBangla) {
                        response = `**${matchedDisease.name} (রোগের তথ্য):**\n\n🔍 লক্ষনসমূহ:\n${matchedDisease.symptoms.map(s => `• ${s}`).slice(0, 3).join('\n')}\n\n🌱 জৈব প্রতিকার:\n${matchedDisease.organicTreatment.map(t => `• ${t}`).slice(0, 2).join('\n')}\n\n🧪 রাসায়নিক প্রতিকার:\n${matchedDisease.chemicalTreatment.map(t => `• ${t}`).slice(0, 2).join('\n')}\n\n🛡️ প্রতিরোধ:\n${matchedDisease.prevention.map(p => `• ${p}`).slice(0, 2).join('\n')}`;
                    } else {
                        response = `**Expert Clinical View: ${matchedDisease.name}**\n\n🔍 **Diagnostics**:\n${matchedDisease.symptoms.map(s => `• ${s}`).join('\n')}\n\n🌱 **Organic Controls**:\n${matchedDisease.organicTreatment.map(t => `• ${t}`).join('\n')}\n\n🧪 **Chemical Intervention**:\n${matchedDisease.chemicalTreatment.map(t => `• ${t}`).join('\n')}\n\n🛡️ **Bio-Security**:\n${matchedDisease.prevention.map(p => `• ${p}`).join('\n')}`;
                    }
                } else {
                    // Just crop name mentioned - show list
                    const diseaseList = cropData.diseases.map(d => d.name).join(', ');
                    response = isBangla
                        ? `${targetCrop} ফসলে সাধারণত এই রোগগুলো দেখা যায়: ${diseaseList}। আপনি কি কোনো নির্দিষ্ট লক্ষণ দেখছেন?`
                        : `Commonly identified pathologies in ${targetCrop} include: ${diseaseList}. Are you observing specific symptoms?`;
                }
                return res.json({ response });
            }
        }

        // 4. General Agricultural Patterns
        if (lowerMessage.includes('organic') || lowerMessage.includes('জৈব')) {
            response = isBangla
                ? "🌱 **জৈব কৃষি সুরক্ষা:**\n• নিমের তেল (পোকামাকড় দমনে)\n• কপার ছত্রাকনাশক (ছত্রাক দমনে)\n• বেকিং সোডা দ্রবণ (পাউডারি মিল্ডিউ দমনে)\n• রসুন স্প্রে (প্রাকৃতিক বিকর্ষণ)\n\nজৈব পদ্ধতি প্রতিরোধমূলক ব্যবস্থায় সবচেয়ে ভালো কাজ করে।"
                : "🌱 **Professional Organic Protocols:**\n• **Neem Oil Concentrate** - Broad-spectrum pest management\n• **Fixed Copper Bactericides** - Fungal suppression\n• **Potassium Bicarbonate** - Powdery mildew elimination\n• **Cultural Hygiene** - Strategic debris removal\n\nOrganic success relies on early systemic prevention.";
        }
        else if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('cropguard'))) {
            response = isBangla
                ? "**ক্রপগার্ড (CropGuard) যেভাবে কাজ করে:**\n1️⃣ আক্রান্ত গাছের পরিষ্কার ছবি তুলুন\n2️⃣ আমাদের AI ছবি বিশ্লেষণ করবে\n3️⃣ তাৎক্ষণিক রোগ শনাক্তকরণ\n4️⃣ বিশেষজ্ঞ প্রতিকারের পরামর্শ\n\nনির্ভুলতা: ৯৫%+ | সময়: তাৎক্ষণিক ⚡"
                : "**CropGuard Operational Protocol:**\n1️⃣ **Capture**: High-resolution image of the affected plant tissue\n2️⃣ **Analysis**: AI-driven neural network processing\n3️⃣ **Diagnosis**: Instant identification of specific pathologies\n4️⃣ **Resolution**: Clinical treatment & prevention strategies\n\nAccuracy Index: 95%+ | Latency: Real-time ⚡";
        }
        else if (lowerMessage.includes('help') || lowerMessage.includes('সাহায্য') || lowerMessage.includes('পারেন')) {
            response = isBangla
                ? "আমি আপনাকে এই বিষয়গুলোতে সাহায্য করতে পারি:\n🔍 রোগ শনাক্তকরণ\n💊 প্রতিকার পরামর্শ\n🛡️ প্রতিরোধ কৌশল\n🌾 ফসল ভিত্তিক তথ্য\n❓ সাধারণ কৃষি প্রশ্ন\n\nআপনি কি কোনো নির্দিষ্ট ফসল বা রোগ সম্পর্কে জানতে চান?"
                : "I am programmed to provide support in:\n🔍 Diagnostic Identification\n💊 Clinical Treatment Protocols\n🛡️ Bio-Security & Prevention\n🌾 Agronomic Intelligence\n📚 Database Access\n\nPlease state the crop type or specific symptoms.";
        }
        else {
            response = isBangla
                ? "দুঃখিত, আমি ঠিক বুঝতে পারছি না। আপনি কি চাষ করা ফসল (টমেটো, আলু, ধান, গম, তুলা) বা রোগের নাম উল্লেখ করতে পারেন?"
                : "I'm sorry, I couldn't categorize that query. For professional guidance, please specify the crop (Tomato, Potato, Rice, Wheat, Cotton) or describe the symptoms (e.g., 'Yellow spots on tomato leaves').";
        }

        res.json({ response });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            response: "Agricultural Intelligence Server is currently re-calibrating. Please consult the Disease Library."
        });
    }
};

const getFAQs = async (req, res) => {
    try {
        const faqs = [
            { question: "How accurate is the disease detection?", answer: "Our AI model maintains a 95%+ accuracy index, verified through clinical field testing." },
            { question: "What crops are supported?", answer: "Current protocol supports Tomato, Potato, Rice, Wheat, and Cotton." },
            { question: "Is my farm data secure?", answer: "Yes, all data is encrypted via industry-standard protocols." }
        ];
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @desc    Get user notifications (pending messages)
// @route   GET /api/chatbot/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        // Find unread notifications
        const notifications = await Notification.find({
            userId: req.user._id,
            isRead: false
        }).sort({ createdAt: 1 });

        // Mark them as read
        if (notifications.length > 0) {
            await Notification.updateMany(
                { _id: { $in: notifications.map(n => n._id) } },
                { $set: { isRead: true } }
            );
        }

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

module.exports = { sendMessage, getFAQs, getNotifications };
