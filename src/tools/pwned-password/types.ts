export interface PwnedPasswordOutputData {
  isPwned: boolean;
  pwnedCount: number;   // 0 if not found, actual count if found
  prefix: string;       // the 5-char prefix used (safe to show)
  checkedAt: string;
}
