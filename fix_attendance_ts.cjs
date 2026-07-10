const fs = require('fs');
const filePath = 'src/components/kkn/Attendance.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add Copy to imports if not present
if (!content.includes('Copy,')) {
  content = content.replace(
    'import { Users, Clock, MapPin, Camera, RefreshCw, X, Plus, AlertCircle, Play, CheckCircle2, MoreVertical, Trash2, StopCircle, Check, Search, Download, Database, ShieldAlert, ArrowLeft, ChevronDown, UserCheck, Lock } from "lucide-react";',
    'import { Users, Clock, MapPin, Camera, RefreshCw, X, Plus, AlertCircle, Play, CheckCircle2, MoreVertical, Trash2, StopCircle, Check, Search, Download, Database, ShieldAlert, ArrowLeft, ChevronDown, UserCheck, Lock, Copy } from "lucide-react";'
  );
}

// Fix handleUpdateStatus call
content = content.replace(
  'handleUpdateStatus(member.id, member.full_name, e.target.value)',
  'handleUpdateStatus(member.id, e.target.value)'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Fixed Attendance.tsx TS errors.");
