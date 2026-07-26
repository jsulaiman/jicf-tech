export type CycleStatus = "open" | "closed";

export interface Group {
  id: string;
  name: string;
  /** Shared passcode members enter to view this group's submit/assignments/
   * tracking pages. Empty string means no passcode has been set yet — those
   * pages stay locked until an admin sets one. */
  passcode: string;
  createdAt: string;
}

export interface Member {
  id: string;
  groupId: string;
  name: string;
  phone: string;
  active: boolean;
  createdAt: string;
}

export interface Cycle {
  id: string;
  label: string;
  weekStart: string;
  status: CycleStatus;
  createdAt: string;
}

export interface Commitment {
  id: string;
  cycleId: string;
  groupId: string;
  memberId: string;
  obedienceText: string;
  phone: string;
  submittedAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  cycleId: string;
  groupId: string;
  commitmentId: string;
  partnerMemberId: string;
  selfAssigned: boolean;
  calledAt: string | null;
  prayedAt: string | null;
  notes: string;
  createdAt: string;
}

export interface Database {
  groups: Group[];
  members: Member[];
  cycles: Cycle[];
  commitments: Commitment[];
  assignments: Assignment[];
}
