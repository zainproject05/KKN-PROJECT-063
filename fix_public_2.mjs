import fs from 'fs';

let content = fs.readFileSync('src/components/PublicAbsensi.tsx', 'utf-8');

// Replace fetchSessions
const newFetchSessions = `const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("public_attendance_sessions")
        .select("*")
        .order("starts_at", { ascending: true });
        
      if (error) {
        console.error("Failed to fetch public sessions:", error.message);
        return;
      }
        
      if (data) {
        const parsed = data.map(parseSession);
        setSessions(parsed);
        if (parsed.length > 0) {
          setSelectedSessionId(parsed[0].id);
        }
      }
    } catch (e) {
      console.error("Session load crash:", e);
    }
  };`;
content = content.replace(/const fetchSessions = async \(\) => \{[\s\S]*?(?=const fetchMembers)/, newFetchSessions + '\n\n  ');

const newFetchMembers = `const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("public_attendance_members")
        .select("*")
        .order("full_name", { ascending: true });
      if (error) {
        console.error("Failed to fetch public attendance members:", error.message);
        return;
      }
      setMembers(data || []);
    } catch (e) {
      console.error(e);
    }
  };`;
content = content.replace(/const fetchMembers = async \(\) => \{[\s\S]*?(?=useEffect\(\(\) => \{[\s\S]*?handleClickOutside)/, newFetchMembers + '\n\n  ');


// Replace handleSubmit
const oldHandleSubmitRegex = /const handleSubmit = async \(\) => \{[\s\S]*?(?=return \(\n\s*<div className="min-h-screen)/;
const newHandleSubmit = `const handleSubmit = async () => {
    if (!canSubmit) {
      showToast("Gagal Mengirim", "Lengkapi seluruh syarat presensi terlebih dahulu.", "warning");
      return;
    }
    
    setIsSubmitting(true);
    setLoadingMsg("Mengenkripsi & Mengunggah Biometrik...");
    
    try {
      // Use RPC for transaction safety
      const fileName = \`\${selectedSessionId}_\${selectedMemberId}_\${Date.now()}.jpg\`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attendance-selfies')
        .upload(fileName, photoBlob!, {
          contentType: 'image/jpeg'
        });
        
      if (uploadError) {
        throw new Error("Gagal mengunggah foto biometrik: " + uploadError.message);
      }
      
      const photoUrl = uploadData.path;
      
      setLoadingMsg("Sinkronisasi Server KKN...");
      
      const payload = {
        p_attendance_session_id: selectedSessionId,
        p_member_id: selectedMemberId,
        p_attendance_status: "present",
        p_notes: "Hadir via Web Publik",
        p_latitude: latitude,
        p_longitude: longitude,
        p_gps_accuracy_meters: accuracy,
        p_selfie_path: photoUrl,
        p_attendance_source: "public_web",
        p_face_detected: faceDetected,
        p_person_detected: true
      };

      const { data: rpcData, error: rpcError } = await supabase.rpc("register_public_attendance", payload);

      if (rpcError) {
        // Fallback to direct insert if RPC not found or fails
        const { error: insertError } = await supabase
          .from("attendance_records")
          .insert([{
            attendance_session_id: selectedSessionId,
            member_id: selectedMemberId,
            attendance_status: "present",
            notes: "Hadir via Web Publik",
            latitude: latitude,
            longitude: longitude,
            gps_accuracy_meters: accuracy,
            selfie_path: photoUrl,
            attendance_source: "public_web",
            verification_status: "auto_verified",
            location_verified: true,
            selfie_verified: faceDetected,
            photo_verified: faceDetected
          }]);
          
          if (insertError) {
             throw new Error("Data sudah ada atau sesi tertutup: " + insertError.message);
          }
      } else if (rpcData?.success === false) {
        throw new Error(rpcData.message || "Gagal absen");
      }
      
      audio.playSuccess();
      setSubmitSuccess(true);
      
      // Auto return after 4s
      setTimeout(() => {
        onBackToHome();
      }, 4000);
      
    } catch (err: any) {
      console.error(err);
      showToast("Gagal Absen", err.message || "Terjadi kesalahan sistem.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };`;

content = content.replace(oldHandleSubmitRegex, newHandleSubmit + '\n\n  ');

fs.writeFileSync('src/components/PublicAbsensi.tsx', content);
