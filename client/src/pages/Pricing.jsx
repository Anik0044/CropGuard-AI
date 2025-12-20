import { Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
    return (
        <div className="bg-earth-50 min-h-screen py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-nature-900 mb-4">সহজ, স্বচ্ছ মূল্য</h1>
                    <p className="text-xl text-stone-600 max-w-2xl mx-auto">
                        আপনার কৃষি চাহিদার জন্য সবচেয়ে উপযুক্ত প্ল্যান বেছে নিন। সকল প্ল্যানে আমাদের মূল AI রোগ সনাক্তকরণ অন্তর্ভুক্ত রয়েছে।
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Free Plan */}
                    <PricingCard
                        name="ফ্রি"
                        price="৳০"
                        period="/মাস"
                        description="CropGuard পরীক্ষা করার জন্য উপযুক্ত"
                        features={[
                            { text: "প্রতি মাসে ১০টি স্ক্যান", included: true },
                            { text: "মৌলিক রোগ সনাক্তকরণ", included: true },
                            { text: "চিকিৎসা সুপারিশ", included: true },
                            { text: "ইমেইল সহায়তা", included: true },
                            { text: "রোগ লাইব্রেরি অ্যাক্সেস", included: true },
                            { text: "বিস্তারিত বিশ্লেষণ", included: false },
                            { text: "অগ্রাধিকার সহায়তা", included: false },
                            { text: "API অ্যাক্সেস", included: false }
                        ]}
                        buttonText="শুরু করুন"
                        buttonLink="/register"
                        highlighted={false}
                    />

                    {/* Farmer Plan */}
                    <PricingCard
                        name="কৃষক"
                        price="৳৪৯৯"
                        period="/মাস"
                        description="ব্যক্তিগত কৃষকদের জন্য সর্বোত্তম"
                        features={[
                            { text: "সীমাহীন স্ক্যান", included: true },
                            { text: "উন্নত AI সনাক্তকরণ", included: true },
                            { text: "বিস্তারিত চিকিৎসা পরিকল্পনা", included: true },
                            { text: "অগ্রাধিকার ইমেইল ও চ্যাট সহায়তা", included: true },
                            { text: "রোগ লাইব্রেরি অ্যাক্সেস", included: true },
                            { text: "স্ক্যান ইতিহাস ও বিশ্লেষণ", included: true },
                            { text: "মোবাইল অ্যাপ অ্যাক্সেস", included: true },
                            { text: "API অ্যাক্সেস", included: false }
                        ]}
                        buttonText="ফ্রি ট্রায়াল শুরু করুন"
                        buttonLink="/register"
                        highlighted={true}
                        badge="সর্বাধিক জনপ্রিয়"
                    />

                    {/* Enterprise Plan */}
                    <PricingCard
                        name="এন্টারপ্রাইজ"
                        price="৳১,৯৯৯"
                        period="/মাস"
                        description="কৃষি সংস্থাগুলির জন্য"
                        features={[
                            { text: "সীমাহীন স্ক্যান", included: true },
                            { text: "উন্নত AI সনাক্তকরণ", included: true },
                            { text: "কাস্টম চিকিৎসা প্রোটোকল", included: true },
                            { text: "২৪/৭ ফোন ও চ্যাট সহায়তা", included: true },
                            { text: "রোগ লাইব্রেরি অ্যাক্সেস", included: true },
                            { text: "উন্নত বিশ্লেষণ ড্যাশবোর্ড", included: true },
                            { text: "মোবাইল অ্যাপ অ্যাক্সেস", included: true },
                            { text: "API অ্যাক্সেস ও ইন্টিগ্রেশন", included: true }
                        ]}
                        buttonText="সেলস টিমের সাথে যোগাযোগ করুন"
                        buttonLink="/contact"
                        highlighted={false}
                    />
                </div>

                {/* Additional Info */}
                <div className="mt-16 text-center">
                    <h2 className="text-3xl font-bold text-nature-900 mb-8">প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী</h2>
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
                        <FAQItem
                            question="আমি কি যেকোনো সময় প্ল্যান পরিবর্তন করতে পারি?"
                            answer="হ্যাঁ! আপনি যেকোনো সময় আপনার প্ল্যান আপগ্রেড, ডাউনগ্রেড বা বাতিল করতে পারেন। পরিবর্তনগুলি অবিলম্বে কার্যকর হয়।"
                        />
                        <FAQItem
                            question="আপনারা কি রিফান্ড প্রদান করেন?"
                            answer="আমরা সকল পেইড প্ল্যানের জন্য ১৪-দিনের মানি-ব্যাক গ্যারান্টি প্রদান করি। কোনো প্রশ্ন ছাড়াই।"
                        />
                        <FAQItem
                            question="কি ফ্রি ট্রায়াল আছে?"
                            answer="হ্যাঁ! সকল পেইড প্ল্যানের সাথে ৭-দিনের ফ্রি ট্রায়াল আসে। কোনো ক্রেডিট কার্ডের প্রয়োজন নেই।"
                        />
                        <FAQItem
                            question="আপনারা কোন পেমেন্ট পদ্ধতি গ্রহণ করেন?"
                            answer="আমরা সকল প্রধান ক্রেডিট কার্ড, ডেবিট কার্ড এবং bKash/Nagad পেমেন্ট গ্রহণ করি।"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const PricingCard = ({ name, price, period, description, features, buttonText, buttonLink, highlighted, badge }) => (
    <div className={`card relative ${highlighted ? 'ring-4 ring-nature-500 transform scale-105' : ''}`}>
        {badge && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    {badge}
                </span>
            </div>
        )}

        <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-nature-900 mb-2">{name}</h3>
            <p className="text-stone-600 text-sm mb-4">{description}</p>
            <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-extrabold text-nature-800">{price}</span>
                <span className="text-stone-500">{period}</span>
            </div>
        </div>

        <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                    {feature.included ? (
                        <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    ) : (
                        <X className="text-stone-300 flex-shrink-0 mt-0.5" size={20} />
                    )}
                    <span className={feature.included ? "text-stone-700" : "text-stone-400"}>
                        {feature.text}
                    </span>
                </li>
            ))}
        </ul>

        <Link
            to={buttonLink}
            className={`block text-center py-3 rounded-xl font-bold transition ${highlighted
                ? 'bg-gradient-to-r from-nature-600 to-nature-700 text-white hover:from-nature-700 hover:to-nature-800 shadow-lg'
                : 'bg-stone-100 text-nature-800 hover:bg-stone-200'
                }`}
        >
            {buttonText}
        </Link>
    </div>
);

const FAQItem = ({ question, answer }) => (
    <div className="card">
        <h3 className="font-bold text-nature-900 mb-2">{question}</h3>
        <p className="text-stone-600 text-sm">{answer}</p>
    </div>
);

export default Pricing;
