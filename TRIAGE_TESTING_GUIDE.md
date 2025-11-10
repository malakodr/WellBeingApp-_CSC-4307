# Quick Start Guide - Triage Feature

## 🚀 Testing the Feature

### Current Status:
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:5173

### Access the Feature:
1. Open browser to: **http://localhost:5173/triage**
2. You should see the "Wellbeing Check-In" form

---

## 🧪 Test Cases

### Test 1: CRISIS Route (High Risk Detection)
**Steps:**
1. Select topic: **Anxiety**
2. Mood slider: **1** (Very Low) 😢
3. Urgency: **Medium**
4. Message: Type **"I want to hurt myself"**
5. Click **"Get Personalized Support"**

**Expected Result:**
- 🚨 Red alert banner appears
- Emergency numbers displayed: **141** and **112**
- "Request Immediate Callback" button visible
- Crisis support messaging

---

### Test 2: BOOK Route (Professional Support)
**Steps:**
1. Select topic: **Academic** 📚
2. Mood slider: **3** (Neutral) 😐
3. Urgency: **High**
4. Message: Leave empty or add "Struggling with exams"
5. Click **"Get Personalized Support"**

**Expected Result:**
- 📅 Blue banner with counselor recommendation
- Shows topic filter: "Academic"
- "Find a Counselor" button → navigates to /book
- "Retake Assessment" option

---

### Test 3: PEER Route (Peer Support)
**Steps:**
1. Select topic: **Loneliness** 😔
2. Mood slider: **4** (Good) 🙂
3. Urgency: **Low**
4. Message: Optional - "Would like to talk to others"
5. Click **"Get Personalized Support"**

**Expected Result:**
- 💬 Purple banner about peer support
- Room name shown: "loneliness-support"
- "Join LONELINESS-SUPPORT" button
- Alternative options: Book counselor or retake

---

## 🎨 Form Features to Notice

### Interactive Elements:
- **Topic chips** - Click to select, highlights with primary color
- **Mood slider** - Emojis change size/opacity based on selection
- **Urgency buttons** - Visual feedback on selection
- **Validation** - Required fields show error messages
- **Loading state** - Spinner appears during submission
- **Smooth transitions** - Fade animations between form and results

### Mobile Responsive:
- Works perfectly on mobile devices
- Touch-friendly button sizes
- Readable text at all screen sizes

---

## 🔍 What to Look For

### Form Validation:
- Try submitting without selecting a topic → Error appears
- All required fields marked with **\***
- Optional message field works without content

### Risk Detection Keywords:
Try these in the message field to trigger CRISIS route:
- "self-harm"
- "suicide"
- "hurt myself"
- "violence"
- "kill"

### Route Logic:
- **High urgency** → Always routes to BOOK (unless risk detected)
- **Risk keywords** → Always routes to CRISIS
- **Low/Medium urgency + no risk** → Routes to PEER

---

## 📱 Screenshots Locations

The app should look like this:

### Form View:
- Clean white card on gradient background
- All 4 input sections clearly labeled
- Privacy message at bottom
- Large submit button

### Result Views:
- **Crisis**: Bright red alert, emergency numbers
- **Book**: Professional blue theme, counselor info
- **Peer**: Friendly purple, community focus

---

## 🐛 Troubleshooting

### If form doesn't submit:
1. Check browser console for errors
2. Verify backend is running on port 5000
3. Check network tab for API call to `/api/triage`
4. Ensure you're logged in (auth token in localStorage)

### If styling looks broken:
1. Clear browser cache
2. Check Tailwind CSS is loading
3. Verify all CSS files are imported

### If routes don't work:
1. Check console for navigation errors
2. Verify React Router is set up correctly
3. Check `/book` and `/rooms/:roomId` routes exist

---

## 💡 Pro Tips

1. **Test all three routes** to see the different outcomes
2. **Try different urgency levels** to understand routing logic
3. **Use the "Try Again" button** to quickly test multiple scenarios
4. **Check the database** - triage submissions are saved in `TriageForm` table
5. **Monitor crisis alerts** - high-risk submissions create `CrisisAlert` records

---

## 📊 Check Database Records

After submitting forms, you can check the database:

```bash
cd backend
npx prisma studio
```

Look at:
- **TriageForm** table - all submissions
- **CrisisAlert** table - high-risk cases
- Fields to check: `route`, `riskFlag`, `topic`, `moodScore`, `urgency`

---

## ✅ Success Indicators

You'll know it's working correctly when:
- ✅ Form submits without errors
- ✅ Appropriate result screen appears based on inputs
- ✅ Buttons navigate to correct pages
- ✅ Animations are smooth
- ✅ Mobile view looks good
- ✅ Database records are created

---

## 🎯 Next Actions

After testing, you can:
1. Customize the crisis phone numbers for your region
2. Adjust the risk detection keywords
3. Modify the mood score range if needed
4. Add more topic options
5. Customize the result messages
6. Integrate with actual counselor booking system
7. Connect to real peer support rooms

---

**Enjoy testing the Triage & Routing feature! 🎉**
