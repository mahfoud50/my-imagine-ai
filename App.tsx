  const handleGenerate = async () => {
    // 1. التحقق من أن المستخدم كتب وصفاً
    if (!settings.prompt.trim()) {
        alert(language === 'ar' ? 'الرجاء كتابة وصف للصورة' : 'Please enter a prompt');
        return;
    }

    setIsGenerating(true);

    try {
      // 2. استخدام محرك Flux (يعمل على Vercel 100% بدون مشاكل CORS)
      // نقوم بتوليد رقم عشوائي (seed) لضمان صورة مختلفة في كل مرة
      const randomSeed = Math.floor(Math.random() * 1000000000);
      
      // رابط التوليد المباشر (لا يحتاج مفتاح)
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(settings.prompt)}?width=1024&height=1024&seed=${randomSeed}&model=flux&nologo=true`;

      // 3. جلب الصورة للتأكد من أنها جاهزة
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();

      // 4. تحويل الصورة لعرضها في الموقع
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = () => {
          const base64data = reader.result as string;

          // تحديث الواجهة
          setActiveImage(base64data);
          setOriginalImage(base64data);

          // إضافة للسجل
          const newItem: HistoryItem = { 
            id: Date.now().toString(), 
            imageUrl: base64data, 
            prompt: settings.prompt, 
            timestamp: new Date(), 
            model: 'Flux Realism', 
            type: 'Generated' 
          };
          
          setHistory(prev => [newItem, ...prev].slice(0, 20));
          
          // إشعار نجاح
          addNotification(
            language === 'ar' ? 'تم التوليد بنجاح' : 'Generated Successfully', 
            language === 'ar' ? 'تم تجاوز حماية CORS بنجاح!' : 'CORS bypassed successfully!', 
            'success'
          );
      };

    } catch (error) {
      console.error("Generation Error:", error);
      addNotification('Error', 'فشل التوليد. حاول مرة أخرى.', 'system');
    } finally {
      setIsGenerating(false);
    }
  };
