import fs from 'fs';
let content = fs.readFileSync('src/components/AboutProject.tsx', 'utf-8');

content = content.replace(
  'const [subTab, setSubTab] = useState<"about" | "workflow" | "ethics">("about");',
  'const [subTab, setSubTab] = useState<"about" | "workflow" | "ethics">("about");\n  const [toastMessage, setToastMessage] = useState<string | null>(null);\n\n  const showToast = (message: string) => {\n    setToastMessage(message);\n    setTimeout(() => setToastMessage(null), 3000);\n  };'
);

// We need to render the toast. Add it at the end of the root div.
// Search for `</motion.div>\n    </div>\n  );\n}`
content = content.replace(
  '      </motion.div>\n    </div>\n  );\n}',
  '      </motion.div>\n      <AnimatePresence>\n        {toastMessage && (\n          <motion.div\n            initial={{ opacity: 0, y: 20, scale: 0.95 }}\n            animate={{ opacity: 1, y: 0, scale: 1 }}\n            exit={{ opacity: 0, y: 20, scale: 0.95 }}\n            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#040508]/95 border border-cyan-500/30 text-cyan-50 px-5 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl z-50 flex items-center gap-3 font-semibold text-sm"\n          >\n            <CheckCircle2 className="w-5 h-5 text-cyan-400" />\n            <span>{toastMessage}</span>\n          </motion.div>\n        )}\n      </AnimatePresence>\n    </div>\n  );\n}'
);

fs.writeFileSync('src/components/AboutProject.tsx', content);
