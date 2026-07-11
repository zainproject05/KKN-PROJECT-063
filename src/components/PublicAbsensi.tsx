import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, MapPin, CheckCircle2, ChevronLeft, Map, Copy, 
  Clock, AlertCircle, Info, Check, AlertTriangle, Search, 
  User, RefreshCw, Shield, Sparkles, Eye, Navigation, Globe, Smartphone 
} from "lucide-react";
import { ModernPremiumLogo } from "./Navigation";
import InteractiveBlueprintBackground from "./InteractiveBlueprintBackground";
import { parseSession, serializeRecord } from "../utils/attendanceHelper";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function PublicAbsensi({ onBackToHome }: { onBackToHome: () => void }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMemberDropdown, setShowMemberDropdown] = useState<boolean>(false);
  
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [bestLocation, setBestLocation] = useState<{latitude: number, longitude: number, accuracy: number, timestamp: string} | null>(null);
  const [gpsTimestamp, setGpsTimestamp] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Stop watching GPS on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isValidatingFace, setIsValidatingFace] = useState(false);
  const [photoValidMsg, setPhotoValidMsg] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const closeExpiredSessions = async () => {
    try {
      await supabase.rpc("close_expired_attendance_sessions");
    } catch (e) {
      console.error("RPC Error:", e);
    }
  };
  const [successData, setSuccessData] = useState<any>(null);
  
  const [toast, setToast] = useState<{title: string, message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  const [mapStyleMode, setMapStyleMode] = useState<"satellite" | "cyber">("satellite");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' = 'info' as any) => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("attendance_sessions")
        .select("*")
        .eq("is_public", true)
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
  };

  const fetchMembers = async () => {
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
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMemberDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    closeExpiredSessions();
    fetchMembers();
    fetchSessions();
    
    // Subscribe to realtime updates on attendance_sessions
    const channel = supabase
      .channel("public_attendance_sessions_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance_sessions"
        },
        () => {
          console.log("Realtime: Attendance sessions updated, fetching again...");
          fetchSessions();
        }
      )
      .subscribe();
    
    const interval = setInterval(() => {
      closeExpiredSessions();
    }, 60000);
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Map Initialization & Watcher
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = latitude || -7.821178;
    const initialLng = longitude || 110.327217;

    const styleObj: any = {
      version: 8,
      sources: {
        "satellite-tiles": {
          "type": "raster",
          "tiles": [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          ],
          "tileSize": 256,
          "attribution": "Esri"
        },
        "dark-tiles": {
          "type": "raster",
          "tiles": [
            "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          ],
          "tileSize": 256,
          "attribution": "Carto"
        }
      },
      layers: [
        {
          "id": "satellite-layer",
          "type": "raster",
          "source": "satellite-tiles",
          "minzoom": 0,
          "maxzoom": 20,
          "layout": {
            "visibility": mapStyleMode === "satellite" ? "visible" : "none"
          }
        },
        {
          "id": "dark-layer",
          "type": "raster",
          "source": "dark-tiles",
          "minzoom": 0,
          "maxzoom": 20,
          "layout": {
            "visibility": mapStyleMode === "cyber" ? "visible" : "none"
          }
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleObj,
      center: [initialLng, initialLat],
      zoom: latitude ? 16 : 13,
      attributionControl: false,
    });

    mapRef.current = map;

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    // Add initial pulse marker if GPS loaded
    if (latitude && longitude) {
      const markerEl = document.createElement("div");
      markerEl.className = "relative w-10 h-10 flex items-center justify-center";
      markerEl.innerHTML = `
        <div class="absolute w-8 h-8 bg-cyan-500/25 border-2 border-cyan-400 rounded-full animate-ping"></div>
        <div class="relative w-4 h-4 bg-cyan-400 border-2 border-white rounded-full shadow-[0_0_12px_rgba(34,211,238,0.9)] flex items-center justify-center">
          <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: markerEl })
        .setLngLat([longitude, latitude])
        .addTo(map);
      markerRef.current = marker;
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync GPS coordinate updates to Map
  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const markerEl = document.createElement("div");
    markerEl.className = "relative w-10 h-10 flex items-center justify-center";
    markerEl.innerHTML = `
      <div class="absolute w-10 h-10 bg-cyan-500/20 border border-cyan-400 rounded-full animate-ping"></div>
      <div class="relative w-5 h-5 bg-cyan-500 border-2 border-white rounded-full shadow-[0_0_16px_rgba(6,182,212,0.9)] flex items-center justify-center">
        <div class="w-2 h-2 bg-white rounded-full"></div>
      </div>
    `;

    const marker = new maplibregl.Marker({ element: markerEl })
      .setLngLat([longitude, latitude])
      .addTo(mapRef.current);
    
    markerRef.current = marker;

    mapRef.current.flyTo({
      center: [longitude, latitude],
      zoom: 17,
      speed: 1.4,
      essential: true
    });
  }, [latitude, longitude]);

  // Sync Map style mode swaps
  useEffect(() => {
    if (!mapRef.current) return;
    try {
      if (mapRef.current.getLayer("satellite-layer")) {
        mapRef.current.setLayoutProperty(
          "satellite-layer",
          "visibility",
          mapStyleMode === "satellite" ? "visible" : "none"
        );
      }
      if (mapRef.current.getLayer("dark-layer")) {
        mapRef.current.setLayoutProperty(
          "dark-layer",
          "visibility",
          mapStyleMode === "cyber" ? "visible" : "none"
        );
      }
    } catch (e) {
      console.error("Map layer switch error:", e);
    }
  }, [mapStyleMode]);

  const updateMapMarker = useCallback((lat: number, lng: number, acc: number) => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    map.setView([lng, lat], 18);
    
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      markerRef.current = new maplibregl.Marker({ color: "#06b6d4" })
        .setLngLat([lng, lat])
        .addTo(map);
    }
    
    // Accuracy circle logic
    let source = map.getSource('accuracy-circle-source') as maplibregl.GeoJSONSource;
    const circleData: any = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      properties: {
        radius: acc
      }
    };
    
    if (!source) {
      map.addSource('accuracy-circle-source', {
        type: 'geojson',
        data: circleData
      });
      map.addLayer({
        id: 'accuracy-circle-layer',
        type: 'circle',
        source: 'accuracy-circle-source',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            10, ['*', ['get', 'radius'], 0.1], // simplified approximation
            20, ['*', ['get', 'radius'], 2]
          ],
          'circle-color': '#06b6d4',
          'circle-opacity': 0.2,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#06b6d4'
        }
      });
    } else {
      source.setData(circleData);
    }
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolokasi Gagal", "Browser Anda tidak mendukung fitur lokasi GPS.", "error");
      return;
    }
    
    setIsLocating(true);
    
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = position.coords.accuracy;

        setLatitude(lat);
        setLongitude(lng);
        setAccuracy(acc);
        setGpsTimestamp(new Date().toISOString());

        setBestLocation(prev => {
          if (!prev || acc < prev.accuracy) {
            return { latitude: lat, longitude: lng, accuracy: acc, timestamp: new Date().toISOString() };
          }
          return prev;
        });

        updateMapMarker(lat, lng, acc);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        showToast("Lokasi Gagal", "Pastikan GPS aktif dan izin lokasi diberikan ke browser.", "error");
      },
      geoOptions
    );
  };
  
  const startCamera = async () => {
    setCameraActive(true);
    setPhotoDataUrl(null);
    setPhotoBlob(null);
    setFaceDetected(false);
    setPhotoValidMsg("");
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      showToast("Kamera Gagal", "Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.", "error");
      console.error(e);
      setCameraActive(false);
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };
  
  const detectFace = async (imgElement: HTMLImageElement | HTMLVideoElement): Promise<boolean> => {
    try {
      await tf.ready();
      const model = await blazeface.load();
      const predictions = await model.estimateFaces(imgElement, false);
      return predictions.length > 0;
    } catch (e) {
      console.error("Face detection failed:", e);
      return true; // Fallback to allow if ML fails
    }
  };
  
  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoDataUrl(dataUrl);
    
    canvas.toBlob((blob) => {
      setPhotoBlob(blob);
    }, 'image/jpeg', 0.85);
    
    stopCamera();
    
    setIsValidatingFace(true);
    const img = new Image();
    img.src = dataUrl;
    img.onload = async () => {
      const hasFace = await detectFace(img);
      setFaceDetected(hasFace);
      setIsValidatingFace(false);
      if (hasFace) {
        setPhotoValidMsg("Biometrik wajah terverifikasi dengan tingkat kecocokan optimal.");
      } else {
        setPhotoValidMsg("Wajah tidak terdeteksi dengan jelas. Harap posisikan wajah di tengah area scanner.");
      }
    };
  };
  
  const retakePhoto = () => {
    setPhotoDataUrl(null);
    setPhotoBlob(null);
    setFaceDetected(false);
    setPhotoValidMsg("");
    startCamera();
  };
  
  useEffect(() => {
    return () => stopCamera();
  }, []);
  
  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  
  const isSessionOpen = useCallback(() => {
    if (!selectedSession) return false;
    const now = new Date();
    const startsAt = new Date(selectedSession.starts_at);
    const endsAt = new Date(selectedSession.ends_at);
    return now >= startsAt && now <= endsAt;
  }, [selectedSession]);
  
  const selectedMember = members.find(m => m.id === selectedMemberId);
  const canSubmit = selectedSession && selectedMemberId && bestLocation && photoBlob && faceDetected && isSessionOpen();
  
  const checklist = [
    { label: 'Sesi absensi aktif dipilih', checked: !!selectedSession && isSessionOpen() },
    { label: 'Identitas anggota terverifikasi', checked: !!selectedMemberId },
    { label: 'Titik koordinat GPS ter-lock', checked: !!bestLocation },
    { label: 'Biometrik wajah tervalidasi', checked: !!photoDataUrl && faceDetected }
  ];

  const handleSubmit = async () => {
    if (!canSubmit) {
      showToast("Gagal Mengirim", "Lengkapi seluruh syarat presensi terlebih dahulu.", "warning");
      return;
    }
    
    if (!bestLocation || bestLocation.accuracy > 1000) {
      showToast("Gagal Mengirim", "Akurasi GPS terlalu rendah (lebih dari 1000 meter). Silakan ambil lokasi ulang.", "error");
      return;
    }

    setIsSubmitting(true);
    setLoadingMsg("Mengenkripsi & Mengunggah Biometrik...");
    
    try {
      const { data: existingRows, error: existingError } = await supabase
        .from("attendance_records")
        .select("id")
        .eq("attendance_session_id", selectedSessionId)
        .eq("member_id", selectedMemberId)
        .limit(1);

      if (existingError) throw existingError;
      
      const existingRec = existingRows?.[0] || null;

      if (existingRec) {
        showToast("Presensi Gagal", "Anda sudah melakukan absensi pada sesi ini.", "error");
        setIsSubmitting(false);
        return;
      }

      const fileName = `${selectedSessionId}_${selectedMemberId}_${Date.now()}.jpg`;
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
      
      const recordMeta = {
        session_id: selectedSessionId,
        member_id: selectedMemberId,
        status: "present",
        manual_override: false,
        manual_override_reason: "",
        check_in_at: new Date().toISOString(),
        notes: "Hadir via Web Publik",
        latitude: bestLocation!.latitude,
        longitude: bestLocation!.longitude,
        gps_accuracy_meters: bestLocation!.accuracy,
        selfie_path: photoUrl,
        face_detected: faceDetected,
        source: "public_web"
      };
      
      const serializedNotes = serializeRecord(recordMeta, "Hadir via Web Publik");
      
      const insertPayload = {
        attendance_session_id: selectedSessionId,
        member_id: selectedMemberId,
        attendance_status: "present",
        notes: serializedNotes,
        latitude: bestLocation!.latitude,
        longitude: bestLocation!.longitude,
        selfie_path: photoUrl,
        source: "public_web",
        gps_accuracy_meters: bestLocation!.accuracy,
        face_detected: faceDetected,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from("attendance_records")
        .insert([insertPayload]);
        
      if (insertError) {
        console.warn("Direct insert failed, falling back to RPC...", insertError.message);
        
        const { error: rpcError, data: rpcData } = await supabase.rpc("register_public_attendance", {
          p_session_id: selectedSessionId,
          p_member_id: selectedMemberId,
          p_attendance_status: "present",
          p_latitude: bestLocation!.latitude,
          p_longitude: bestLocation!.longitude,
          p_gps_accuracy_meters: bestLocation!.accuracy,
          p_selfie_path: photoUrl,
          p_evidence_path: null,
          p_evidence_type: null,
          p_note: null,
          p_face_detected: faceDetected,
          p_person_detected: faceDetected, // approximating from faceDetected
          p_client_timestamp: new Date().toISOString(),
          p_user_agent: navigator.userAgent
        });

        if (rpcError) {
          throw new Error("RPC Error: " + rpcError.message);
        }
        
        if (rpcData && (rpcData as any).ok === false) {
           throw new Error((rpcData as any).message || "Absensi ditolak oleh sistem.");
        }
      }
      
      setSuccessData({
        member_name: selectedMember?.full_name || "Anggota",
        member_nim: selectedMember?.nim || "-",
        member_role: selectedMember?.kkn_role || "Anggota",
        session_name: selectedSession?.activity_name || "Sesi KKN",
        timestamp: new Date().toISOString(),
        latitude,
        longitude,
        accuracy
      });
      
      setSubmitSuccess(true);
      setIsSubmitting(false);
      setLoadingMsg("");
    } catch (e: any) {
      console.error("Public attendance submit failed:", e);
      showToast("Presensi Gagal", "Presensi gagal dikirim. Silakan coba lagi.", "error");
      setIsSubmitting(false);
      setLoadingMsg("");
    }
  };

  const filteredMembers = searchQuery.trim() === "" 
    ? members 
    : members.filter(m => 
        m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.nim.includes(searchQuery)
      );

  if (submitSuccess && successData) {
    return (
      <div className="w-full min-h-screen bg-[#020306] text-white flex flex-col z-10 overflow-y-auto font-sans relative">
        <InteractiveBlueprintBackground />
        
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 z-10 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl bg-gradient-to-b from-[#0e111a]/95 to-[#050609]/95 border border-cyan-500/20 rounded-[32px] p-8 md:p-12 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Glowing cyber aesthetics */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-80" />
            <div className="absolute -top-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-24 h-24 bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 rounded-full flex items-center justify-center mb-8 relative border border-cyan-400/30">
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping opacity-25" />
              <CheckCircle2 className="w-12 h-12 text-cyan-400" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">PRESENSI TERVERIFIKASI</h2>
            <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
              Sistem telah mendata kehadiran Anda secara resmi dengan enkripsi GPS & Biometrik Wajah.
            </p>
            
            <div className="w-full bg-[#05060a]/60 border border-white/5 rounded-2xl p-6 text-left space-y-5 mb-8 shadow-inner relative">
              <div className="absolute top-4 right-4 text-[9px] font-mono text-cyan-400/40 uppercase tracking-widest border border-cyan-500/20 px-2 py-0.5 rounded">
                SECURE RECEIPT
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Nama Anggota</div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>{successData.member_name}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 pl-6">NIM: {successData.member_nim} • {successData.member_role}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Agenda / Sesi</div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{successData.session_name}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Stempel Waktu</div>
                  <div className="text-xs text-slate-200">{new Date(successData.timestamp).toLocaleString("id-ID", { dateStyle: 'medium', timeStyle: 'medium' })} WIB</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Lokasi & Presisi GPS</div>
                  <div className="text-xs font-mono text-cyan-400 flex items-center gap-1.5 mt-1 bg-cyan-950/40 w-fit px-2.5 py-1 rounded-md border border-cyan-500/20">
                    <MapPin className="w-3.5 h-3.5 animate-pulse" />
                    <span>±{Math.round(successData.accuracy)}m (LOCKED)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full gap-4">
              <a 
                href={`https://www.google.com/maps?q=${successData.latitude},${successData.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2.5 transition-colors cursor-pointer text-sm font-bold text-slate-300"
              >
                <Map className="w-4.5 h-4.5" />
                <span className="tracking-wide">Buka Google Maps</span>
              </a>
              
              <button 
                onClick={onBackToHome}
                className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.55)] cursor-pointer text-sm tracking-wide"
              >
                Kembali ke Beranda
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#020306] text-white flex flex-col z-10 overflow-y-auto font-sans relative">
      <InteractiveBlueprintBackground />
      
      {/* Toast system */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-24 md:top-28 right-4 md:right-10 left-4 md:left-auto z-[100] w-auto max-w-md"
          >
            <div className={`p-5 rounded-[24px] backdrop-blur-2xl flex items-start gap-4 shadow-2xl relative overflow-hidden transition-all border ${
              toast.type === 'error' 
                ? 'bg-[#1a0c0e]/95 border-red-500/30 shadow-[0_12px_40px_rgba(239,68,68,0.25)]' 
                : toast.type === 'success' 
                ? 'bg-[#0c1a14]/95 border-emerald-500/30 shadow-[0_12px_40px_rgba(16,185,129,0.25)]' 
                : 'bg-[#1a140c]/95 border-amber-500/30 shadow-[0_12px_40px_rgba(245,158,11,0.25)]'
            }`}>
              {/* Cyber-Grid Pattern Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none opacity-20" />
              
              {/* Top Accent Strip */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] ${
                toast.type === 'error' ? 'bg-gradient-to-r from-red-600 to-rose-500' :
                toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' :
                'bg-gradient-to-r from-amber-500 to-yellow-500'
              }`} />

              <div className="relative z-10 flex gap-3.5">
                <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 border ${
                  toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                  toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}>
                  {toast.type === 'error' ? <AlertCircle className="w-5 h-5 animate-pulse" /> : 
                   toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                   <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-widest text-white uppercase">{toast.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-semibold">{toast.message}</p>
                </div>
              </div>

              {/* Glowing animated sliding timing bar */}
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-[2px] ${
                  toast.type === 'error' ? 'bg-red-500/55' :
                  toast.type === 'success' ? 'bg-emerald-500/55' :
                  'bg-amber-500/55'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header Dock */}
      <div className="w-full px-4 md:px-8 py-5 flex items-center justify-between bg-[#050609]/90 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBackToHome}
            className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="hidden md:block">
            <ModernPremiumLogo size={10} />
          </div>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <h1 className="text-xl font-extrabold text-white tracking-tight">Portal Absensi KKN</h1>
          <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-widest mt-0.5">KKN PMU-063</p>
        </div>
        
        {/* Glowing Online Status Badge */}
        <div className="flex items-center gap-2 bg-[#0d2a20] border border-emerald-500/30 rounded-full px-3 py-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Online</span>
        </div>
      </div>

      <div className="flex-1 w-full max-w-full px-4 md:px-8 lg:px-12 xl:px-16 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pb-24 relative z-10">
        
        {/* Left Column: Detail Sesi, Identitas, Lokasi Perangkat */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* Card 1: Detail Sesi */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#0c0f1b] to-[#040508] border-t border-l border-white/[0.08] border-b border-r border-black/45 rounded-3xl p-6 md:p-8 shadow-[8px_8px_24px_rgba(0,0,0,0.55),_-8px_-8px_24px_rgba(255,255,255,0.015),_inset_1px_1px_2px_rgba(255,255,255,0.05)] hover:shadow-[12px_12px_32px_rgba(0,0,0,0.65),_-12px_-12px_32px_rgba(255,255,255,0.02)] transition-all duration-300 flex-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Detail Sesi</h2>
                </div>
                <div className="relative">
                  <select 
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="bg-gradient-to-b from-[#131622] to-[#0a0c12] border border-white/10 rounded-xl py-2 px-3.5 text-xs text-slate-200 outline-none hover:border-cyan-500/50 cursor-pointer font-bold shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),_2px_2px_8px_rgba(0,0,0,0.4)] transition-all"
                  >
                    {sessions.map(s => (
                      <option key={s.id} value={s.id} className="bg-[#0b0c10] text-white">{s.activity_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedSession ? (
                <div className="space-y-5 pt-1">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Aktivitas</div>
                    <div className="text-lg font-black text-white mt-1 leading-tight">{selectedSession.activity_name}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Waktu</div>
                      <div className="text-xs font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>
                          {new Date(selectedSession.starts_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedSession.ends_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lokasi</div>
                      <div className="text-xs font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{selectedSession.location_name || 'Posko KKN'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  Belum ada sesi presensi aktif yang terdaftar.
                </div>
              )}
            </div>

            <div className="pt-4 mt-auto">
              {selectedSession && (
                isSessionOpen() ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a1a15] text-emerald-400 border border-emerald-500/25 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-[inset_1px_1px_2px_rgba(255,255,255,0.02)]">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                    Presensi Terbuka
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a0c0e] text-red-400 border border-red-500/25 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-[inset_1px_1px_2px_rgba(255,255,255,0.02)]">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                    Sesi Berakhir
                  </div>
                )
              )}
            </div>
          </motion.div>

          {/* Card 2: Identitas */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-[#0c0f1b] to-[#040508] border-t border-l border-white/[0.08] border-b border-r border-black/45 rounded-3xl p-6 md:p-8 shadow-[8px_8px_24px_rgba(0,0,0,0.55),_-8px_-8px_24px_rgba(255,255,255,0.015),_inset_1px_1px_2px_rgba(255,255,255,0.05)] hover:shadow-[12px_12px_32px_rgba(0,0,0,0.65),_-12px_-12px_32px_rgba(255,255,255,0.02)] transition-all duration-300 flex-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-5 pb-2 border-b border-white/5">
                <User className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Identitas</h2>
              </div>

              <div className="space-y-4 relative" ref={dropdownRef}>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Cari nama anggota..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowMemberDropdown(true);
                    }}
                    onFocus={() => setShowMemberDropdown(true)}
                    className="w-full bg-[#050609]/70 border-t border-l border-black/55 border-b border-r border-white/10 rounded-xl py-3.5 pl-11 pr-5 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-[inset_2px_2px_8px_rgba(0,0,0,0.85)] font-semibold focus:border-cyan-500/40"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Search className="w-4 h-4 text-slate-500" />
                  </div>
                  {searchQuery && (
                    <button 
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedMemberId("");
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-bold bg-white/5 hover:bg-white/15 px-2 py-1 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Autocomplete dropdown box */}
                <AnimatePresence>
                  {showMemberDropdown && filteredMembers.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 right-0 top-14 bg-[#0d101a]/95 border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 max-h-60 overflow-y-auto divide-y divide-white/5 backdrop-blur-3xl"
                    >
                      {filteredMembers.map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedMemberId(m.id);
                            setSearchQuery(m.full_name);
                            setShowMemberDropdown(false);
                          }}
                          className="w-full text-left p-4 hover:bg-cyan-500/10 hover:text-cyan-200 transition-colors flex flex-col cursor-pointer"
                        >
                          <span className="text-sm font-bold text-white">{m.full_name}</span>
                          <span className="text-[10px] text-slate-400 mt-1">NIM: {m.nim} • {m.kkn_role || 'Anggota'}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Selected Profile Card */}
            <div className="mt-5">
              {selectedMember ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#040508]/80 border border-cyan-500/15 rounded-2xl p-4 flex items-center gap-4 shadow-inner"
                >
                  <div className="w-12 h-12 bg-gradient-to-tr from-cyan-600/10 to-indigo-600/10 rounded-full flex items-center justify-center border border-cyan-500/20 shrink-0">
                    <User className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Terpilih</div>
                    <div className="text-sm font-black text-white truncate mt-0.5">{selectedMember.full_name}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      NIM: {selectedMember.nim} • {selectedMember.kkn_role || 'Anggota'}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-xs text-slate-500 italic py-4 text-center border border-dashed border-white/5 rounded-2xl">
                  Belum ada identitas terpilih. Silakan cari nama di atas.
                </div>
              )}
            </div>
          </motion.div>

          {/* Card 3: Lokasi Perangkat */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#0c0f1b] to-[#040508] border-t border-l border-white/[0.08] border-b border-r border-black/45 rounded-3xl p-6 md:p-8 shadow-[8px_8px_24px_rgba(0,0,0,0.55),_-8px_-8px_24px_rgba(255,255,255,0.015),_inset_1px_1px_2px_rgba(255,255,255,0.05)] hover:shadow-[12px_12px_32px_rgba(0,0,0,0.65),_-12px_-12px_32px_rgba(255,255,255,0.02)] transition-all duration-300 flex-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '20s' }} />
                  <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Lokasi Perangkat</h2>
                </div>
                
                {/* Map mode toggle switch */}
                {latitude && (
                  <div className="flex bg-black/40 border border-white/10 rounded-lg p-0.5 shadow-inner">
                    <button
                      onClick={() => setMapStyleMode("satellite")}
                      className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${mapStyleMode === 'satellite' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500'}`}
                    >
                      Satelit HD
                    </button>
                    <button
                      onClick={() => setMapStyleMode("cyber")}
                      className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${mapStyleMode === 'cyber' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500'}`}
                    >
                      Dark HUD
                    </button>
                  </div>
                )}
              </div>

              {/* Realistic HD & Satellite Interactive Map Canvas */}
              <div className="w-full aspect-[16/10] bg-[#050608] border border-white/10 rounded-2xl overflow-hidden relative shadow-inner mb-4 flex flex-col items-center justify-center">
                <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
                
                {/* Overlay Holographic Radar Screen when no GPS secured */}
                {!latitude && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-black/55 backdrop-blur-[1px] p-4 text-center z-10">
                    <div className="w-14 h-14 rounded-full border border-cyan-500/20 flex items-center justify-center mb-3 relative overflow-hidden">
                      <div className="absolute inset-0 border-t-2 border-cyan-400 rounded-full animate-spin" />
                      <Navigation className="w-5 h-5 text-cyan-400 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">GPS RADAR ACTIVE</span>
                    <span className="text-[9px] text-slate-500 mt-1 max-w-[200px]">Tekan "Ambil Lokasi Saya" di bawah untuk melacak GPS.</span>
                  </div>
                )}
                
                {/* Custom Map Coordinates HUD overlay (matching user request image) */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md border border-white/10 rounded-xl p-3 z-10 flex flex-col gap-2 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Koordinat Terkunci</div>
                      <div className="text-xs font-mono text-cyan-400 font-bold mt-1">
                        {bestLocation ? `${bestLocation.latitude.toFixed(6)}, ${bestLocation.longitude.toFixed(6)}` : (latitude ? `${latitude.toFixed(6)}, ${longitude?.toFixed(6)}` : "-, -")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Akurasi</div>
                      <div className={`text-xs font-bold mt-1 ${
                        !bestLocation ? "text-slate-500" :
                        bestLocation.accuracy <= 50 ? "text-emerald-400" : 
                        bestLocation.accuracy <= 200 ? "text-cyan-400" : 
                        bestLocation.accuracy <= 1000 ? "text-amber-400" : "text-red-400"
                      }`}>
                        {bestLocation ? `±${Math.round(bestLocation.accuracy)}m` : (accuracy ? `±${Math.round(accuracy)}m` : "-")}
                      </div>
                    </div>
                  </div>
                  {bestLocation && (
                    <div className="flex items-center justify-between border-t border-white/10 pt-2 mt-1">
                      <div className="text-[9px] text-slate-400">
                        Update: {new Date(bestLocation.timestamp).toLocaleTimeString('id-ID')}
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                        {bestLocation.accuracy <= 50 ? "Sangat Akurat" : 
                         bestLocation.accuracy <= 200 ? "Cukup Akurat" : 
                         bestLocation.accuracy <= 1000 ? "Kurang Akurat" : "Tidak Akurat"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {bestLocation && (
                <div className="flex gap-2 mb-4">
                  <a 
                    href={`https://www.google.com/maps?q=${bestLocation.latitude},${bestLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Buka Maps</span>
                  </a>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${bestLocation.latitude}, ${bestLocation.longitude}`);
                      showToast("Tersalin", "Koordinat berhasil disalin.", "success");
                    }}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Salin Koordinat</span>
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={handleGetLocation}
              className="w-full py-4 bg-gradient-to-br from-[#121626] to-[#070912] hover:from-[#181d33] hover:to-[#0a0c1a] border-t border-l border-white/10 border-b border-r border-black/60 rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-[4px_4px_12px_rgba(0,0,0,0.5),_-4px_-4px_12px_rgba(255,255,255,0.01),_inset_1px_1px_2px_rgba(255,255,255,0.05)] active:scale-98 disabled:opacity-50"
            >
              {isLocating ? (
                <div className="w-5 h-5 border-2 border-slate-500 border-t-cyan-400 rounded-full animate-spin" />
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-200">{bestLocation ? "Ambil Ulang Lokasi" : "Ambil Lokasi Saya"}</span>
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Right Column: Camera / Biometrics proof */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-[#0c0f1b] to-[#040508] border-t border-l border-white/[0.08] border-b border-r border-black/45 rounded-3xl p-6 md:p-8 shadow-[8px_8px_24px_rgba(0,0,0,0.55),_-8px_-8px_24px_rgba(255,255,255,0.015),_inset_1px_1px_2px_rgba(255,255,255,0.05)] hover:shadow-[12px_12px_32px_rgba(0,0,0,0.65),_-12px_-12px_32px_rgba(255,255,255,0.02)] transition-all duration-300 flex-1 flex flex-col justify-between"
          >
            <div className="flex items-center gap-2.5 mb-6 pb-2 border-b border-white/5">
              <Camera className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Bukti Kehadiran</h2>
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              
              {/* Luxurious holographic camera preview screen */}
              <div className="bg-[#020305] border-t border-l border-black/85 border-b border-r border-white/10 rounded-2xl overflow-hidden relative aspect-[4/3] w-full flex flex-col items-center justify-center mb-6 shadow-[inset_4px_4px_16px_rgba(0,0,0,0.95)]">
                
                {/* Scanner Glowing Bars & Indicators */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">LIVE BIOMETRICS</span>
                </div>
                
                {!cameraActive && !photoDataUrl ? (
                  <button 
                    onClick={startCamera}
                    className="flex flex-col items-center gap-4 text-slate-400 hover:text-white transition-colors p-8 group cursor-pointer h-full w-full justify-center z-10"
                  >
                    <div className="w-20 h-20 bg-white/5 border border-white/10 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 rounded-full flex items-center justify-center transition-all shadow-inner">
                      <Camera className="w-7 h-7 text-slate-400 group-hover:text-cyan-400" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-black uppercase tracking-widest block text-cyan-400 mb-1">Aktifkan Kamera</span>
                      <span className="text-[10px] text-slate-500 font-mono">Verifikasi biometrik wajah real-time</span>
                    </div>
                  </button>
                ) : null}
                
                <video 
                  ref={videoRef} 
                  className={`w-full h-full object-cover transform scale-x-[-1] ${cameraActive && !photoDataUrl ? 'block' : 'hidden'}`}
                  playsInline
                  muted
                />
                
                {photoDataUrl && (
                  <img src={photoDataUrl} alt="Selfie" className="w-full h-full object-cover transform scale-x-[-1]" />
                )}
                
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Clean and simple camera preview feed */}
                
                {/* Embedded shutter capture ring button (matching requested image) */}
                {cameraActive && !photoDataUrl && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
                    <button 
                      onClick={takePhoto}
                      className="w-16 h-16 rounded-full border-[3px] border-white/55 flex items-center justify-center bg-black/40 hover:border-cyan-400 active:scale-95 transition-all cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Photo Validation status */}
              <div className="mb-6">
                {isValidatingFace && (
                  <div className="p-4 bg-[#05060a] border border-cyan-500/20 rounded-2xl flex items-center justify-center gap-3 shadow-inner">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-cyan-400/90 tracking-wider uppercase animate-pulse">MEMVERIFIKASI STRUKTUR WAJAH...</span>
                  </div>
                )}

                {photoDataUrl && !isValidatingFace && (
                  <div className="flex flex-col gap-3">
                    <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-inner ${
                      faceDetected 
                        ? 'bg-[#081a10] border-emerald-500/20' 
                        : 'bg-[#1a0c0e] border-rose-500/20'
                    }`}>
                      <div className={`mt-0.5 ${faceDetected ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {faceDetected ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5 animate-bounce" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-bold ${faceDetected ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {faceDetected ? 'Biometrik Terverifikasi' : 'Peringatan Biometrik'}
                          </h4>
                          {faceDetected && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider rounded border border-emerald-500/30">PASS</span>
                          )}
                        </div>
                        <p className={`text-xs ${faceDetected ? 'text-emerald-200/70' : 'text-rose-200/70'} leading-relaxed`}>
                          {photoValidMsg}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={retakePhoto}
                      className="w-full py-3 bg-[#0a0c12] hover:bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs font-bold text-slate-300 shadow-[2px_2px_8px_rgba(0,0,0,0.3)]"
                    >
                      <Camera className="w-4 h-4" />
                      Ambil Ulang Foto
                    </button>
                  </div>
                )}
              </div>

              {/* Attendance Checklist panel */}
              <div className="bg-[#040509]/80 border-t border-l border-black/75 border-b border-r border-white/5 rounded-2xl p-5 mb-6 shadow-[inset_2px_2px_8px_rgba(0,0,0,0.85)]">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Persyaratan Presensi</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {checklist.map((item, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center gap-3 p-3 rounded-xl border-t border-l border-white/5 border-b border-r border-black/50 shadow-[3px_3px_10px_rgba(0,0,0,0.4),_-2px_-2px_6px_rgba(255,255,255,0.02)] transition-all ${item.checked ? 'bg-gradient-to-br from-[#0c1424] to-[#060a12]' : 'bg-gradient-to-br from-[#08090d] to-[#040508]'}`}
                    >
                      {item.checked ? (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(255,255,255,0.4),_0_0_8px_rgba(6,182,212,0.4)] shrink-0">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#0a0c12] border border-white/5 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.6)] shrink-0 flex items-center justify-center" />
                      )}
                      <span className={`text-xs font-semibold tracking-wide ${item.checked ? 'text-slate-100' : 'text-slate-500'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Large CTA Submit Button */}
              <button 
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-sm uppercase tracking-widest relative overflow-hidden group ${
                  canSubmit && !isSubmitting 
                    ? 'bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-[6px_6px_20px_rgba(0,0,0,0.55),_inset_1px_1px_2px_rgba(255,255,255,0.25)] hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 cursor-pointer active:scale-[0.98]' 
                    : 'bg-[#080a10]/50 text-slate-600 cursor-not-allowed border border-white/5 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.7)]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                    <span>{loadingMsg}</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Absensi</span>
                    <motion.div 
                      className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform" 
                      style={{ transitionDuration: '1.2s' }} 
                    />
                  </>
                )}
              </button>
              
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
