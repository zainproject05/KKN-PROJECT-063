import fs from 'fs';
let content = fs.readFileSync('src/components/PublicAbsensi.tsx', 'utf-8');

// Replace the data loading logic
const oldFetch = `useEffect(() => {
    // 1. Fetch Active Open Sessions
    const fetchSessionsAndMembers = async () => {
      try {
        const { data: dbSessions } = await supabase
          .from("attendance_sessions")
          .select("*")
          .eq("status", "open")
          .eq("is_public", true)
          .order("created_at", { ascending: false });

        const activeSessions = (dbSessions || []).map(parseSession);
        setSessions(activeSessions);

        // Auto-select if only 1
        if (activeSessions.length === 1) {
          setSelectedSessionId(activeSessions[0].id);
        }

        // 2. Fetch Members
        const { data: dbMembers } = await supabase
          .from("members")
          .select("*")
          .eq("is_active", true)
          .order("full_name", { ascending: true });
        
        setMembers(dbMembers || []);
      } catch (err) {
        console.error("Error fetching data for public absensi:", err);
      }
    };
    fetchSessionsAndMembers();
  }, []);`;

// Wait, let's just find where it sets up sessions and members. I'll print the relevant code first.
