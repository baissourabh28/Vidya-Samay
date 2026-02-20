from ortools.sat.python import cp_model
from typing import List, Dict
import json

class TimetableScheduler:
    def __init__(self, classrooms, faculty, subjects, batches, constraints):
        self.classrooms = classrooms
        self.faculty = faculty
        self.subjects = subjects
        self.batches = batches
        self.constraints = constraints
        
        # Time slots: 5 days, 8 slots per day (9am-5pm)
        self.days = constraints.get('days', 5)
        self.slots_per_day = constraints.get('slots_per_day', 8)
        self.total_slots = self.days * self.slots_per_day
        
    def generate_schedules(self, num_solutions=3):
        model = cp_model.CpModel()
        
        # Variables: assignment[batch][subject][slot][classroom][faculty]
        assignments = {}
        
        for batch in self.batches:
            batch_id = batch['id']
            assignments[batch_id] = {}
            
            for subject in self.subjects:
                if subject['batch_id'] != batch_id:
                    continue
                    
                subject_id = subject['id']
                classes_needed = subject.get('classes_per_week', 3)
                assignments[batch_id][subject_id] = []
                
                for _ in range(classes_needed):
                    slot_vars = {}
                    for slot in range(self.total_slots):
                        for classroom in self.classrooms:
                            for fac in self.faculty:
                                if subject_id in fac.get('subjects', []):
                                    var = model.NewBoolVar(f'b{batch_id}_s{subject_id}_sl{slot}_c{classroom["id"]}_f{fac["id"]}')
                                    slot_vars[(slot, classroom['id'], fac['id'])] = var
                    
                    assignments[batch_id][subject_id].append(slot_vars)
        
        # Constraint 1: Each class assigned exactly once
        for batch_id in assignments:
            for subject_id in assignments[batch_id]:
                for class_vars in assignments[batch_id][subject_id]:
                    model.Add(sum(class_vars.values()) == 1)
        
        # Constraint 2: No faculty double-booking
        for slot in range(self.total_slots):
            for fac in self.faculty:
                fac_id = fac['id']
                slot_assignments = []
                for batch_id in assignments:
                    for subject_id in assignments[batch_id]:
                        for class_vars in assignments[batch_id][subject_id]:
                            for (s, c, f), var in class_vars.items():
                                if s == slot and f == fac_id:
                                    slot_assignments.append(var)
                if slot_assignments:
                    model.Add(sum(slot_assignments) <= 1)
        
        # Constraint 3: No classroom double-booking
        for slot in range(self.total_slots):
            for classroom in self.classrooms:
                c_id = classroom['id']
                room_assignments = []
                for batch_id in assignments:
                    for subject_id in assignments[batch_id]:
                        for class_vars in assignments[batch_id][subject_id]:
                            for (s, c, f), var in class_vars.items():
                                if s == slot and c == c_id:
                                    room_assignments.append(var)
                if room_assignments:
                    model.Add(sum(room_assignments) <= 1)
        
        # Constraint 4: No batch double-booking
        for slot in range(self.total_slots):
            for batch_id in assignments:
                batch_assignments = []
                for subject_id in assignments[batch_id]:
                    for class_vars in assignments[batch_id][subject_id]:
                        for (s, c, f), var in class_vars.items():
                            if s == slot:
                                batch_assignments.append(var)
                if batch_assignments:
                    model.Add(sum(batch_assignments) <= 1)
        
        # Solve
        solver = cp_model.CpSolver()
        solution_collector = SolutionCollector(assignments, num_solutions)
        solver.parameters.enumerate_all_solutions = True
        solver.parameters.max_time_in_seconds = 30.0
        
        status = solver.Solve(model, solution_collector)
        
        if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
            return solution_collector.solutions
        
        return []
    
    def check_conflicts(self):
        return []
    
    def get_suggestions(self):
        return [
            "Try reducing classes per week",
            "Add more classrooms or faculty",
            "Increase available time slots"
        ]

class SolutionCollector(cp_model.CpSolverSolutionCallback):
    def __init__(self, assignments, limit):
        cp_model.CpSolverSolutionCallback.__init__(self)
        self._assignments = assignments
        self._limit = limit
        self.solutions = []
    
    def on_solution_callback(self):
        if len(self.solutions) >= self._limit:
            self.StopSearch()
            return
        
        schedule = []
        for batch_id in self._assignments:
            for subject_id in self._assignments[batch_id]:
                for idx, class_vars in enumerate(self._assignments[batch_id][subject_id]):
                    for (slot, classroom, faculty), var in class_vars.items():
                        if self.Value(var):
                            day = slot // 8
                            time_slot = slot % 8
                            schedule.append({
                                'batch': batch_id,
                                'subject': subject_id,
                                'day': day,
                                'slot': time_slot,
                                'classroom': classroom,
                                'faculty': faculty
                            })
        
        self.solutions.append(schedule)
