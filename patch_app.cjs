const fs = require('fs');
const path = './src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const importsToAdd = `
import Tasks from "./components/kkn/Tasks";
import Documents from "./components/kkn/Documents";
import Announcements from "./components/kkn/Announcements";
import Agenda from "./components/kkn/Agenda";
import WhatsAppTemplates from "./components/kkn/WhatsAppTemplates";
`;

if (!content.includes('import Tasks')) {
  content = content.replace('import Settings from "./components/kkn/Settings";', 'import Settings from "./components/kkn/Settings";\n' + importsToAdd);
}

const casesToAdd = `
      case "tasks":
        return <Tasks />;
      case "documents":
        return <Documents />;
      case "announcements":
        return <Announcements />;
      case "agenda":
        return <Agenda />;
      case "whatsapp-templates":
        return <WhatsAppTemplates />;
`;

if (!content.includes('case "tasks":')) {
  content = content.replace('case "settings":\n        return <Settings />;', 'case "settings":\n        return <Settings />;\n' + casesToAdd);
}

const securedTabsRegex = /const securedTabs = \[\n?\s*"dashboard", "attendance", "programs", "finance", "reports", "template-divisi", "members", "picket", "settings"\n?\s*\];/;
content = content.replace(securedTabsRegex, `const securedTabs = [
    "dashboard", "attendance", "programs", "finance", "reports", "template-divisi", "members", "picket", "settings",
    "tasks", "documents", "announcements", "agenda", "whatsapp-templates"
  ];`);

fs.writeFileSync(path, content);
