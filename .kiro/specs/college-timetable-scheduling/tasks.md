# Implementation Plan: College Timetable Scheduling System

## Overview

This implementation plan breaks down the College Timetable Scheduling System into discrete, incremental coding tasks. The plan follows a bottom-up approach: starting with database models and core services, then building the optimization engine, followed by API endpoints, and finally frontend components. Each task builds on previous work, with testing integrated throughout to catch errors early.

## Tasks

- [ ] 1. Set up project infrastructure and database models
  - [x] 1.1 Configure PostgreSQL database connection with SQLAlchemy
    - Create database configuration file with connection pooling
    - Set up environment variables for database credentials
    - Test database connectivity
    - _Requirements: 12.1_
  
  - [x] 1.2 Create SQLAlchemy models for all entities
    - Implement User, Classroom, Batch, Subject, Faculty models
    - Implement TimeSlot, FixedSlot, ElectivePreference models
    - Implement SchedulingConstraints, TimetableOption, TimetableEntry models
    - Implement Conflict, Resolution, Adjustment, ApprovalRecord, ChangeLog models
    - Add foreign key relationships and constraints
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 12.3_
  
  - [ ]* 1.3 Write property test for referential integrity
    - **Property 40: Referential integrity maintained**
    - **Validates: Requirements 12.3**
  
  - [x] 1.4 Create database migration scripts using Alembic
    - Initialize Alembic configuration
    - Generate initial migration for all models
    - Test migration up and down
    - _Requirements: 12.1_

- [ ] 2. Implement authentication service
  - [x] 2.1 Create authentication utilities
    - Implement password hashing with bcrypt
    - Implement JWT token generation and verification
    - Create token expiration handling
    - _Requirements: 1.1, 1.3_
  
  - [x] 2.2 Implement AuthService class
    - Write authenticate_user method
    - Write create_access_token method
    - Write verify_token method
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 2.3 Write property tests for authentication
    - **Property 1: Valid credentials produce JWT tokens**
    - **Validates: Requirements 1.1**
  
  - [ ]* 2.4 Write property test for invalid credentials
    - **Property 2: Invalid credentials are rejected**
    - **Validates: Requirements 1.2**
  
  - [ ]* 2.5 Write property test for token expiration
    - **Property 3: Expired tokens require re-authentication**
    - **Validates: Requirements 1.3**
  
  - [ ]* 2.6 Write property test for session persistence
    - **Property 4: Authenticated sessions persist**
    - **Validates: Requirements 1.4**

- [ ] 3. Implement data management services
  - [x] 3.1 Create CRUD operations for input data entities
    - Implement ClassroomService with create, read, update, delete methods
    - Implement BatchService with CRUD methods
    - Implement SubjectService with CRUD methods
    - Implement FacultyService with CRUD methods
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 3.2 Implement input validation logic
    - Create validation functions for each entity type
    - Implement completeness checks (required fields)
    - Implement consistency checks (valid references, ranges)
    - _Requirements: 2.9_
  
  - [ ]* 3.3 Write property test for input validation
    - **Property 10: Input validation rejects invalid data**
    - **Validates: Requirements 2.9**
  
  - [ ] 3.4 Implement faculty availability and leave management
    - Create methods to store faculty availability time slots
    - Create methods to record faculty leaves
    - Implement logic to mark leave slots as unavailable
    - _Requirements: 2.5, 2.6_
  
  - [ ]* 3.5 Write property test for faculty availability round-trip
    - **Property 6: Faculty availability round-trip**
    - **Validates: Requirements 2.5**
  
  - [ ]* 3.6 Write property test for leave marking slots unavailable
    - **Property 7: Leave marks slots unavailable**
    - **Validates: Requirements 2.6**
  
  - [ ] 3.7 Implement fixed slot and elective preference management
    - Create methods to store fixed slot assignments
    - Create methods to store student elective preferences
    - _Requirements: 2.7, 2.8_
  
  - [ ]* 3.8 Write property test for elective preferences round-trip
    - **Property 9: Elective preferences round-trip**
    - **Validates: Requirements 2.8**
  
  - [ ] 3.9 Implement data update and invalidation logic
    - Add update methods that track affected timetables
    - Implement timetable invalidation when input data changes
    - _Requirements: 2.10_
  
  - [ ]* 3.10 Write property test for data updates invalidating timetables
    - **Property 11: Data updates invalidate timetables**
    - **Validates: Requirements 2.10**

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement optimization engine
  - [ ] 5.1 Set up OR-Tools or PuLP constraint solver
    - Install and configure optimization library
    - Create OptimizationEngine class with solver initialization
    - Implement constraint and objective function interfaces
    - _Requirements: 3.1_
  
  - [ ] 5.2 Implement core scheduling constraints
    - Add no-faculty-double-booking constraint
    - Add no-classroom-double-booking constraint
    - Add faculty availability constraint
    - Add room capacity constraint
    - Add fixed slot constraint
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ]* 5.3 Write property test for no faculty double-booking
    - **Property 12: No faculty double-booking**
    - **Validates: Requirements 3.2**
  
  - [ ]* 5.4 Write property test for no classroom double-booking
    - **Property 13: No classroom double-booking**
    - **Validates: Requirements 3.3**
  
  - [ ]* 5.5 Write property test for faculty availability respected
    - **Property 14: Faculty availability respected**
    - **Validates: Requirements 3.4**
  
  - [ ]* 5.6 Write property test for fixed slots immutability
    - **Property 8: Fixed slots are immutable**
    - **Validates: Requirements 2.7, 3.5**
  
  - [ ]* 5.7 Write property test for room capacity constraints
    - **Property 15: Room capacity constraints satisfied**
    - **Validates: Requirements 3.6**
  
  - [ ] 5.8 Implement optimization objective function
    - Add classroom utilization maximization objective
    - Add faculty workload balancing objective
    - Add student preference satisfaction objective
    - _Requirements: 3.7, 3.9_
  
  - [ ]* 5.9 Write property test for utilization rate target
    - **Property 16: Utilization rate meets target**
    - **Validates: Requirements 3.7**
  
  - [ ]* 5.10 Write property test for student preferences accommodated
    - **Property 18: Student preferences accommodated**
    - **Validates: Requirements 3.9**
  
  - [ ] 5.11 Implement solution generation and multiple options
    - Create solve method that generates multiple solutions
    - Implement solution quality scoring
    - Ensure at least 3 distinct options are generated
    - _Requirements: 3.8_
  
  - [ ]* 5.12 Write property test for multiple timetable options
    - **Property 17: Multiple timetable options generated**
    - **Validates: Requirements 3.8**
  
  - [ ] 5.13 Implement elective scheduling with mixed batches
    - Add logic to group students by elective preferences
    - Allow students from different batches in same elective class
    - _Requirements: 8.4, 8.5_
  
  - [ ]* 5.14 Write property test for mixed batches in electives
    - **Property 34: Mixed batches in electives**
    - **Validates: Requirements 8.4**
  
  - [ ]* 5.15 Write property test for elective group formation
    - **Property 35: Elective groups formed by preferences**
    - **Validates: Requirements 8.5**

- [ ] 6. Implement conflict detection service
  - [ ] 6.1 Create ConflictDetector class
    - Implement detect_conflicts method
    - Add detection for faculty double-booking
    - Add detection for classroom double-booking
    - Add detection for capacity violations
    - Add detection for availability violations
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 6.2 Write property test for comprehensive conflict detection
    - **Property 20: All conflict types detected**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
  
  - [ ] 6.3 Implement resolution suggestion logic
    - Create suggest_resolutions method
    - Generate alternative slot suggestions
    - Generate alternative faculty suggestions
    - Generate alternative classroom suggestions
    - _Requirements: 4.6_
  
  - [ ]* 6.4 Write property test for resolution suggestions
    - **Property 21: Conflicts have resolution suggestions**
    - **Validates: Requirements 4.6**
  
  - [ ] 6.5 Implement timetable validation
    - Create validate_timetable method
    - Ensure validation runs after conflict resolution
    - _Requirements: 4.8_
  
  - [ ]* 6.6 Write property test for resolution triggering re-validation
    - **Property 22: Resolution triggers re-validation**
    - **Validates: Requirements 4.8**

- [ ] 7. Implement timetable service
  - [ ] 7.1 Create TimetableService class
    - Implement generate_timetables method that orchestrates optimization
    - Implement get_timetable method for retrieval
    - Implement get_active_timetable method
    - _Requirements: 3.1, 3.12_
  
  - [ ]* 7.2 Write property test for timetable persistence
    - **Property 19: Generated timetables are persisted**
    - **Validates: Requirements 3.12**
  
  - [ ] 7.3 Implement approval workflow methods
    - Create approve_timetable method
    - Create reject_timetable method
    - Implement audit trail logging
    - Set approved timetable as active
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [ ]* 7.4 Write property test for approval setting active timetable
    - **Property 25: Approval sets active timetable**
    - **Validates: Requirements 6.2**
  
  - [ ]* 7.5 Write property test for rejection storing comments
    - **Property 26: Rejection stores comments**
    - **Validates: Requirements 6.3**
  
  - [ ]* 7.6 Write property test for approval audit trail
    - **Property 27: Approval actions are audited**
    - **Validates: Requirements 6.4**
  
  - [ ] 7.7 Implement real-time adjustment methods
    - Create apply_realtime_adjustment method
    - Implement affected class identification for faculty leave
    - Implement affected class identification for classroom unavailability
    - Generate adjustment suggestions
    - Validate adjustments don't introduce conflicts
    - Log all adjustments
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6_
  
  - [ ]* 7.8 Write property test for faculty leave identifying affected classes
    - **Property 29: Faculty leave identifies affected classes**
    - **Validates: Requirements 7.1**
  
  - [ ]* 7.9 Write property test for classroom unavailability identifying affected classes
    - **Property 30: Classroom unavailability identifies affected classes**
    - **Validates: Requirements 7.2**
  
  - [ ]* 7.10 Write property test for adjustment suggestions
    - **Property 31: Adjustments provide suggestions**
    - **Validates: Requirements 7.3**
  
  - [ ]* 7.11 Write property test for adjustment validation
    - **Property 32: Adjustments validated for conflicts**
    - **Validates: Requirements 7.5**
  
  - [ ]* 7.12 Write property test for adjustment logging
    - **Property 33: Adjustments are logged**
    - **Validates: Requirements 7.6**
  
  - [ ] 7.13 Implement export functionality
    - Create export_timetable method
    - Implement PDF generation using ReportLab or similar
    - Implement Excel generation using openpyxl
    - Ensure only approved timetables can be exported
    - Include all required information in exports
    - _Requirements: 9.1, 9.2, 9.3, 6.5_
  
  - [ ]* 7.14 Write unit tests for PDF and Excel export
    - Test PDF export generates valid files
    - Test Excel export generates valid files
    - _Requirements: 9.1, 9.2_
  
  - [ ]* 7.15 Write property test for export authorization
    - **Property 28: Only approved timetables exportable**
    - **Validates: Requirements 6.5**
  
  - [ ]* 7.16 Write property test for export completeness
    - **Property 36: Export includes complete information**
    - **Validates: Requirements 9.3**

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement FastAPI endpoints
  - [ ] 9.1 Create authentication endpoints
    - Implement POST /api/auth/login endpoint
    - Implement POST /api/auth/refresh endpoint
    - Add JWT token validation middleware
    - _Requirements: 1.1, 1.5_
  
  - [ ]* 9.2 Write property test for protected route authentication
    - **Property 5: Protected routes reject unauthenticated access**
    - **Validates: Requirements 1.5**
  
  - [ ] 9.3 Create input data management endpoints
    - Implement POST /api/classrooms endpoint
    - Implement POST /api/batches endpoint
    - Implement POST /api/subjects endpoint
    - Implement POST /api/faculty endpoint
    - Implement POST /api/constraints endpoint
    - Add request validation using Pydantic models
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 9.4 Create timetable management endpoints
    - Implement POST /api/timetables/generate endpoint
    - Implement GET /api/timetables/{id} endpoint
    - Implement GET /api/timetables/active endpoint
    - Implement POST /api/timetables/{id}/approve endpoint
    - Implement POST /api/timetables/{id}/reject endpoint
    - Implement POST /api/timetables/{id}/adjust endpoint
    - Implement GET /api/timetables/{id}/export endpoint with format parameter
    - _Requirements: 3.1, 6.2, 6.3, 7.1, 9.1, 9.2_
  
  - [ ] 9.5 Create conflict detection endpoints
    - Implement GET /api/timetables/{id}/conflicts endpoint
    - Implement POST /api/conflicts/{id}/resolve endpoint
    - _Requirements: 4.1, 4.6_
  
  - [ ] 9.6 Implement filtering and querying
    - Add query parameters for filtering by department, batch, faculty, classroom
    - Implement filtering logic in timetable retrieval
    - _Requirements: 5.4, 10.4_
  
  - [ ]* 9.7 Write property test for filtering results
    - **Property 24: Filtering returns matching results**
    - **Validates: Requirements 5.4**
  
  - [ ]* 9.8 Write property test for resource sharing across departments
    - **Property 39: Resources shared across departments**
    - **Validates: Requirements 10.4**
  
  - [ ] 9.9 Add error handling to all endpoints
    - Implement error handlers for authentication errors
    - Implement error handlers for validation errors
    - Implement error handlers for optimization errors
    - Implement error handlers for database errors
    - Ensure all errors return proper HTTP status codes and JSON format
    - _Requirements: 1.2, 2.9_
  
  - [ ]* 9.10 Write property test for API authentication requirement
    - **Property 37: API requires authentication**
    - **Validates: Requirements 9.6**
  
  - [ ]* 9.11 Write property test for API JSON responses
    - **Property 38: API returns valid JSON**
    - **Validates: Requirements 9.7**
  
  - [ ]* 9.12 Write property test for timetable entries completeness
    - **Property 23: Timetable entries contain complete information**
    - **Validates: Requirements 5.3**

- [ ] 10. Implement React frontend components
  - [x] 10.1 Set up authentication context and routing
    - Create AuthContext for managing authentication state
    - Implement login page component
    - Add protected route wrapper component
    - Implement token storage and refresh logic
    - _Requirements: 1.1, 1.4, 1.5_
  
  - [x] 10.2 Create Dashboard component
    - Display active timetable summary
    - Show pending approvals count
    - Display recent changes log
    - Show utilization statistics
    - _Requirements: 5.1, 5.2_
  
  - [x] 10.3 Create input forms for data management
    - Build ClassroomForm component with capacity and type fields
    - Build BatchForm component with program, year, student count fields
    - Build SubjectForm component with name, type, duration fields
    - Build FacultyForm component with availability and leave management
    - Build ConstraintsForm component for scheduling parameters
    - Build FixedSlotForm component
    - Build ElectivePreferenceForm component
    - Add form validation and error display
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  
  - [x] 10.4 Create TimetableView component
    - Implement grid view with days and time slots
    - Implement list view organized by faculty/batch/classroom
    - Add view mode toggle
    - Display subject, faculty, classroom, batch, time slot for each entry
    - Highlight conflicts in red
    - _Requirements: 5.1, 5.2, 5.3, 5.6_
  
  - [x] 10.5 Implement filtering and comparison features
    - Add filter controls for department, batch, faculty, classroom
    - Implement filter application logic
    - Create comparison view for multiple timetable options
    - Add option switching controls
    - _Requirements: 5.4, 5.5, 5.7_
  
  - [x] 10.6 Create approval workflow interface
    - Build approval review component
    - Add approve and reject buttons
    - Implement comment input for rejections
    - Display approval history and audit trail
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ] 10.7 Create conflict resolution interface
    - Display detected conflicts with severity indicators
    - Show resolution suggestions for each conflict
    - Add controls to apply suggested resolutions
    - Implement manual adjustment interface
    - _Requirements: 4.6, 4.7_
  
  - [ ] 10.8 Implement real-time adjustment interface
    - Create leave entry form
    - Create classroom unavailability form
    - Display affected classes
    - Show adjustment suggestions
    - Add controls to apply adjustments
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 10.9 Add export functionality to UI
    - Add export buttons for PDF and Excel
    - Implement file download handling
    - Show export progress indicator
    - Display export errors
    - _Requirements: 9.1, 9.2_
  
  - [x] 10.10 Implement responsive design and accessibility
    - Add responsive CSS for mobile, tablet, desktop
    - Implement keyboard navigation
    - Add ARIA labels and roles
    - Ensure proper color contrast
    - Add loading indicators for async operations
    - Display user-friendly error messages
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [ ] 11. Integration and final wiring
  - [ ] 11.1 Connect frontend to backend API
    - Configure Axios with base URL and interceptors
    - Add JWT token to all authenticated requests
    - Implement token refresh on 401 responses
    - Add error handling for network failures
    - _Requirements: 1.1, 1.3, 1.5_
  
  - [ ] 11.2 Test end-to-end workflows
    - Test complete timetable generation workflow
    - Test approval and rejection workflow
    - Test real-time adjustment workflow
    - Test export workflow
    - Test multi-department scheduling
    - _Requirements: 3.1, 6.2, 6.3, 7.1, 9.1, 10.1_
  
  - [ ]* 11.3 Write integration tests for critical paths
    - Test authentication flow from login to protected resource access
    - Test timetable generation from input to approval
    - Test conflict detection and resolution flow
    - Test real-time adjustment flow
    - _Requirements: 1.1, 3.1, 4.1, 7.1_
  
  - [ ] 11.4 Set up API documentation
    - Configure OpenAPI/Swagger documentation
    - Add endpoint descriptions and examples
    - Document authentication requirements
    - Document error responses
    - _Requirements: 9.4_
  
  - [ ] 11.5 Create deployment configuration
    - Create Dockerfile for backend
    - Create Dockerfile for frontend
    - Create docker-compose.yml for local development
    - Add environment variable configuration
    - Document deployment steps
    - _Requirements: 12.1_

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with minimum 100 iterations each
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: database → services → API → frontend
- All property tests should be tagged with format: **Feature: college-timetable-scheduling, Property {number}: {property_text}**
