import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  FirebaseUser,
  Agent,
  Workflow,
  WorkflowExecution,
  KnowledgeBase,
  Document,
  Team,
} from '../types/firebase';

// Users
export const userService = {
  async getUser(uid: string) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as FirebaseUser : null;
  },

  async updateUser(uid: string, data: Partial<FirebaseUser>) {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },
};

// Agents
export const agentService = {
  async createAgent(data: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, 'agents'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getAgent(id: string) {
    const docRef = doc(db, 'agents', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as Agent : null;
  },

  async getUserAgents(userId: string) {
    const q = query(
      collection(db, 'agents'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
      id: doc.id, 
      ...doc.data() 
    }) as Agent);
  },

  async updateAgent(id: string, data: Partial<Agent>) {
    const docRef = doc(db, 'agents', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteAgent(id: string) {
    await deleteDoc(doc(db, 'agents', id));
  },
};

// Workflows
export const workflowService = {
  async createWorkflow(data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, 'workflows'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getWorkflow(id: string) {
    const docRef = doc(db, 'workflows', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as Workflow : null;
  },

  async getUserWorkflows(userId: string) {
    const q = query(
      collection(db, 'workflows'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
      id: doc.id, 
      ...doc.data() 
    }) as Workflow);
  },

  async updateWorkflow(id: string, data: Partial<Workflow>) {
    const docRef = doc(db, 'workflows', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteWorkflow(id: string) {
    await deleteDoc(doc(db, 'workflows', id));
  },
};

// Workflow Executions
export const workflowExecutionService = {
  async createExecution(data: Omit<WorkflowExecution, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, 'workflow_executions'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getExecution(id: string) {
    const docRef = doc(db, 'workflow_executions', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as WorkflowExecution : null;
  },

  async updateExecution(id: string, data: Partial<WorkflowExecution>) {
    const docRef = doc(db, 'workflow_executions', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },
};

// Knowledge Bases
export const knowledgeBaseService = {
  async createKnowledgeBase(data: Omit<KnowledgeBase, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, 'knowledge_bases'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getKnowledgeBase(id: string) {
    const docRef = doc(db, 'knowledge_bases', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as KnowledgeBase : null;
  },

  async getUserKnowledgeBases(userId: string) {
    const q = query(
      collection(db, 'knowledge_bases'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
      id: doc.id, 
      ...doc.data() 
    }) as KnowledgeBase);
  },

  async updateKnowledgeBase(id: string, data: Partial<KnowledgeBase>) {
    const docRef = doc(db, 'knowledge_bases', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteKnowledgeBase(id: string) {
    await deleteDoc(doc(db, 'knowledge_bases', id));
  },
};

// Teams
export const teamService = {
  async createTeam(data: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, 'teams'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getTeam(id: string) {
    const docRef = doc(db, 'teams', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as Team : null;
  },

  async getUserTeams(userId: string) {
    const q = query(
      collection(db, 'teams'),
      where('members', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
      id: doc.id, 
      ...doc.data() 
    }) as Team);
  },

  async updateTeam(id: string, data: Partial<Team>) {
    const docRef = doc(db, 'teams', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteTeam(id: string) {
    await deleteDoc(doc(db, 'teams', id));
  },
}; 