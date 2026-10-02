import {
  Activity, MapPin, Search, Calculator, Hash, Radio,
  Key, ShieldCheck, Fingerprint, Code, FileBadge, ShieldAlert,
  Binary, AlertTriangle, Lock, Eye, ClipboardList, ShieldX, Box
} from "lucide-react";
import React from "react";

export const toolIconMap: Record<string, React.ElementType> = {
  "internet-speed": Activity,
  "ip-lookup": MapPin,
  "dns-lookup": Search,
  "subnet-calculator": Calculator,
  "port-checker": Hash,
  "ping-latency": Radio,
  "password-generator": Key,
  "password-strength": ShieldCheck,
  "hash-generator": Fingerprint,
  "jwt-decoder": Code,
  "file-hash": FileBadge,
  "security-headers": ShieldAlert,
  "binary-text": Binary,
  "breach-checker": AlertTriangle,
  "tls-checker": Lock,
  "whois": Eye,
  "website-security-report": ClipboardList,
  "pwned-password": ShieldX,
};

export const getToolIcon = (id: string) => toolIconMap[id] || Box;
