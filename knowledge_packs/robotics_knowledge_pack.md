# ROBOTICS KNOWLEDGE PACK (v1.0)

*DarkWave Studios LLC — AXIOM Engine — Canon² Knowledge Series*
*Domain: Applied Sciences / Engineering / Computer Science*
*Ontology Alignment: identity, governance, routing, safety, monitoring*

---

## 1. Purpose

This pack encodes the structured knowledge base for Robotics — the interdisciplinary engineering field governing the design, construction, operation, and application of robots. It provides deterministic, queryable knowledge for reasoning about robot kinematics and dynamics, actuation, sensing, control systems, robot programming, autonomous navigation, human-robot interaction, and the deployment of robotic systems across industrial, medical, service, and autonomous domains.

---

## 2. Scope

**Included:**
- Robot kinematics: forward and inverse kinematics, Denavit-Hartenberg
- Robot dynamics: forces, torques, equations of motion
- Actuation: motors, hydraulics, pneumatics, soft actuators
- Sensing: encoders, force/torque, vision, LIDAR, IMU
- Control systems: PID, model predictive control, adaptive control
- Robot programming: ROS, task programming, simulation
- Autonomous navigation: SLAM, path planning, obstacle avoidance
- Sensor fusion: Kalman filter, Bayesian estimation
- Machine learning in robotics: reinforcement learning, imitation learning
- Industrial robotics: manipulators, assembly, welding, painting
- Collaborative robots (cobots) and safety standards
- Mobile robots: wheeled, legged, aerial (drones/UAVs), underwater
- Surgical robotics and medical applications
- Human-robot interaction (HRI) and social robots
- Robot safety standards and governance

**Excluded:**
- Detailed embedded systems (see Electronics/Computer Science pack)
- AI algorithms at theory level beyond robotics application (see AI pack)
- Autonomous vehicles beyond robotic context (see Transportation pack for AV detail)

---

## 3. Structure

This pack is organized in five tiers: (1) mechanical foundations (kinematics, dynamics, actuation); (2) sensing and perception; (3) control, planning, and autonomy; (4) robot types and applications; (5) human-robot interaction, safety, and governance.

---

## 4. Core Concepts

**C01 — Robot Definition and Classification**
Definition: A robot is a programmable mechanical system capable of carrying out complex actions autonomously or semi-autonomously, with sensors to perceive the environment and actuators to act upon it. Classification by mobility (fixed, mobile, aerial, aquatic), structure (serial manipulator, parallel, collaborative), autonomy level (teleoperated, supervised autonomous, fully autonomous), and application domain.
Key relationships: Degrees of freedom (DOF), workspace (reachable volume), payload, speed, repeatability, accuracy (distinct: accuracy = absolute position error; repeatability = consistency returning to a position).

**C02 — Degrees of Freedom**
Definition: DOF: the number of independent parameters describing the state of a mechanical system. A rigid body in 3D space has 6 DOF (3 translation + 3 rotation). Industrial manipulators typically have 6 DOF for arbitrary end-effector pose; redundant robots have 7+ DOF for obstacle avoidance. Kinematically deficient robots have <6 DOF.
Key relationships: Grübler's formula (DOF = 6(n-1) - Σ constraints), over-constrained vs. under-constrained mechanisms, joint types (revolute, prismatic, spherical, cylindrical), serial vs. parallel kinematic structures.

**C03 — Forward Kinematics**
Definition: Given joint angles (θ₁, θ₂, ... θₙ), compute the end-effector position and orientation in world space. Denavit-Hartenberg (D-H) convention: a systematic method assigning coordinate frames to each link and computing transformation matrices (T = Rot(z,θ) × Trans(0,0,d) × Trans(a,0,0) × Rot(x,α)) to find the total transform from base to end-effector.
Key relationships: Homogeneous transformation matrices (4×4), rotation matrix (3×3, SO(3)), D-H parameters (θ, d, a, α), kinematic chain, end-effector frame.

**C04 — Inverse Kinematics**
Definition: Given a desired end-effector pose (position + orientation), compute the joint angles. Analytically tractable for specific geometries (e.g., 6-DOF manipulators with spherical wrist); otherwise solved numerically (Jacobian-based iterative methods: Newton-Raphson, damped least squares). Multiple solutions may exist; singularities (Jacobian rank deficiency) cause infinite solutions or uncontrollability.
Key relationships: Jacobian matrix (J: maps joint velocities to end-effector velocity), singularities (determinant J = 0), redundancy resolution, workspace limits, joint limits.

**C05 — Robot Dynamics**
Definition: Computing the forces/torques required to produce desired motion, or predicting motion given applied forces. Newton-Euler (recursive, efficient for real-time control): forces propagated outward from base, torques inward. Lagrangian method: energy-based, produces equations of motion τ = M(q)q̈ + C(q,q̇)q̇ + G(q), where M = inertia matrix, C = Coriolis, G = gravity.
Key relationships: Joint torque, link inertia tensor, gravity compensation, friction models (Coulomb + viscous), dynamic model identification, computed-torque control.

**C06 — Actuators**
Definition: Convert energy to mechanical motion. Electric: DC motors (brushed and brushless/BLDC), servo motors (DC + encoder + controller), stepper motors (precise open-loop positioning). Hydraulic actuators: high force/torque density, used in heavy construction, Boston Dynamics legacy. Pneumatic actuators: compliant, used in soft robotics, pick-and-place. Piezoelectric: high precision, small stroke.
Key relationships: Torque-speed curve, back-EMF, gear ratio (reducing speed, increasing torque), backdrivability (important for collaborative robots), SEA (Series Elastic Actuators — safe HRI), harmonic drive (compact, high gear ratio, no backlash).

**C07 — Encoders and Joint Sensors**
Definition: Encoders measure joint position and velocity. Incremental encoders: count pulses from reference; require homing. Absolute encoders: output absolute position on power-up; no homing required. Rotary encoders: revolute joints. Linear encoders: prismatic joints. Resolution: counts per revolution (CPR) or lines per revolution (LPR); effective resolution after quadrature decoding = 4× LPR.
Key relationships: Quadrature decoding, Hall-effect sensors (BLDC commutation), resolver (analog, robust, aerospace), encoder error (eccentricity, quantization noise), encoder calibration.

**C08 — Force/Torque Sensors**
Definition: Measure forces and torques applied to the end-effector or at joints. 6-axis F/T sensor (e.g., ATI) measures Fx, Fy, Fz, Tx, Ty, Tz. Used for: contact detection, compliant assembly, polishing, robot learning from demonstration, surgical force feedback. Tactile sensors: distributed pressure arrays for manipulation.
Key relationships: Strain gauge (Wheatstone bridge), capacitive sensing, overload protection, calibration (zero offset, sensitivity matrix), zero-gravity compensation for sensor self-weight.

**C09 — Robot Vision and Perception**
Definition: Cameras provide rich environmental information. 2D vision: RGB cameras for color and pattern detection, object recognition, barcode/QR reading. 3D vision: structured light (Intel RealSense), stereo cameras (ZED, factory inspection), LiDAR (point cloud, navigation). Vision pipelines: image acquisition → preprocessing → feature extraction → object detection (YOLO, Faster RCNN, DINO) → pose estimation.
Key relationships: Camera calibration (intrinsic: focal length, distortion; extrinsic: camera-to-robot transformation), homography, epipolar geometry, point cloud registration (ICP — Iterative Closest Point), stereo disparity map.

**C10 — LiDAR**
Definition: Light Detection and Ranging: emits laser pulses and measures time-of-flight to generate precise 3D point clouds of surroundings. Mechanical scanning (Velodyne HDL-64E: 64 beams, 10–20 Hz), solid-state (MEMS, OPA — no moving parts, more reliable). Range: 50–300 m. Resolution: ~0.1–0.4° angular. Key for autonomous navigation (obstacle detection, SLAM).
Key relationships: Point cloud density, range accuracy (±2–5 cm typical), beam divergence, multi-echo detection (handles semi-transparent surfaces), LiDAR fusion with camera (late fusion, early fusion), adverse weather performance (rain, snow degradation).

**C11 — PID Control**
Definition: Proportional-Integral-Derivative (PID) controller: computes control output u(t) = Kp × e(t) + Ki × ∫e(t)dt + Kd × de/dt, where e(t) = setpoint − actual value. P: removes steady-state error proportionally. I: eliminates steady-state error. D: dampens oscillations by reacting to error rate. Most widely used industrial controller.
Key relationships: Tuning (Ziegler-Nichols, Cohen-Coon, auto-tuning), windup (integrator saturation in limits), derivative kick (use filtered derivative or error-on-measurement variant), cascade control (inner/outer loop), feedforward control.

**C12 — Model Predictive Control (MPC)**
Definition: Optimization-based control predicting future system behavior over a receding horizon and solving an optimization problem at each time step. Handles multi-variable systems with constraints (joint limits, torque limits, obstacle avoidance) naturally. Computationally demanding but increasingly real-time capable. Used in: legged robots, industrial robot optimization, autonomous vehicles.
Key relationships: Cost function (minimize error + control effort), prediction horizon (N steps), receding horizon principle, QP (quadratic programming) solver, stability guarantees, NMPC (nonlinear MPC for nonlinear systems).

**C13 — SLAM (Simultaneous Localization and Mapping)**
Definition: Building a map of an unknown environment while simultaneously tracking the robot's location within it. Classic SLAM: Extended Kalman Filter SLAM (EKF-SLAM), particle filter SLAM (FastSLAM). Graph-based SLAM (g2o, GTSAM): represent as factor graph, optimize globally. LiDAR SLAM: Cartographer (Google), LOAM. Visual SLAM (VSLAM): ORB-SLAM3, COLMAP.
Key relationships: Loop closure detection (recognizing revisited places), pose graph, odometry (wheel, visual, IMU), landmark map, point cloud map, occupancy grid, 2D vs. 3D SLAM.

**C14 — Path Planning**
Definition: Computing a collision-free trajectory from start to goal. Global planners (known map): Dijkstra (optimal, complete), A* (heuristic-guided, optimal with admissible heuristic), RRT (Rapidly-exploring Random Tree: probabilistically complete, handles high-D joint space), PRM (Probabilistic Roadmap). Local planners (reactive): DWA (Dynamic Window Approach), potential fields, TEB (Timed Elastic Band).
Key relationships: Configuration space (C-space, robot state space including joint angles), C-free (collision-free region of C-space), sampling-based vs. graph-search planning, motion primitives, kinodynamic constraints.

**C15 — Sensor Fusion and Kalman Filter**
Definition: Combining multiple sensor measurements to produce a better estimate than any single sensor. Kalman Filter (KF): optimal for linear systems with Gaussian noise. Extended KF (EKF): linearizes nonlinear systems. Unscented KF (UKF): uses sigma points for better nonlinear propagation. Particle Filter: handles arbitrary distributions. IMU + GPS fusion (EKF): fundamental for mobile robot localization.
Key relationships: State vector, measurement model, process model, covariance matrix, innovation (measurement residual), Kalman gain, observability, IMU preintegration.

**C16 — ROS (Robot Operating System)**
Definition: Open-source middleware framework for robot software development. Not an OS but a structured communication framework: nodes (processes), topics (pub-sub messaging), services (request-response), actions (long-running tasks). ROS 2 (2017–present): rebuilt on DDS (Data Distribution Service), real-time capable, multi-robot. Package ecosystem: MoveIt (manipulation), Nav2 (navigation), Gazebo (simulation).
Key relationships: catkin/colcon (build systems), URDF (Unified Robot Description Format), TF2 (transform library), parameter server, rosbag (data recording), Rviz (visualization), SLAM packages, simulation bridges (ROS-Gazebo, ROS-Ignition).

**C17 — Industrial Robot Standards and Safety**
Definition: Industrial robots are typically caged or guarded to prevent human contact during operation. Key standards: ISO 10218-1/2 (safety requirements for industrial robots and robot systems), ISO/TS 15066 (collaborative robots, human-robot collaboration zones). Safety functions: emergency stop, safety-rated monitored stop, speed and separation monitoring, power and force limiting.
Key relationships: Safety integrity level (SIL), performance level (PL), risk assessment (ISO 12100), guarding (fixed, interlocked), safety-rated motion (EN ISO 13849), CE marking, OSHA 1910.217.

**C18 — Collaborative Robots (Cobots)**
Definition: Robots designed to safely operate alongside humans without safety barriers, using force/torque limiting and proximity sensing. Key features: force/power limiting (ISO/TS 15066 PFL mode), contact detection and stop, rounded surfaces, lightweight, easily programmable (lead-through, tablet programming). Key players: Universal Robots (UR3/5/10/16), FANUC CRX, ABB GoFa/SWIFTI, Rethink Robotics (Sawyer).
Key relationships: TCP (Tool Center Point) force/speed limits, biomechanical harm assessment (ISO/TS 15066 Annex A), collaborative operation modes (safety-rated monitored stop, hand guiding, speed/separation monitoring, PFL), ease of integration (end-of-arm tooling ecosystems).

**C19 — Autonomous Mobile Robots (AMRs) and AGVs**
Definition: Autonomous Mobile Robots (AMRs): navigate dynamically using onboard sensors and map (SLAM-based, no floor infrastructure needed); avoid obstacles in real-time. AGVs (Automated Guided Vehicles): follow fixed paths (magnetic tape, QR codes, inductive wire — older, simpler, less flexible). AMRs increasingly dominate: MiR, Locus Robotics, Fetch, Boston Dynamics Spot.
Key relationships: Fleet management system (FMS), traffic management, charging station management, pick-and-pass vs. goods-to-person fulfilment models, warehouse AMR market.

**C20 — Surgical Robotics**
Definition: Robotic systems augmenting or performing surgical procedures. da Vinci (Intuitive Surgical): tele-operated laparoscopic system, master-slave, surgeon console + patient-side robot; FDA-cleared for multiple surgical specialties; 1.5+ million procedures/yr. Orthopedic (MAKO, Stryker): semi-autonomous bone cutting with haptic constraints. Micro-robotics: intravascular, sub-mm scale.
Key relationships: Minimally invasive surgery (MIS), tremor filtering, motion scaling (de-amplification of surgeon hand movements), force feedback (limited in da Vinci), haptic feedback, remote surgery (limited by latency), FDA 510(k) clearance for surgical devices.

**C21 — Drone/UAV Systems**
Definition: Unmanned Aerial Vehicles (UAVs) / drones. Multirotor (quadrotor most common): vertical takeoff/landing (VTOL), stable hover, simple mechanics, limited endurance (20–45 min). Fixed-wing: efficient forward flight, longer range, requires runway/catapult. VTOL fixed-wing: hybrid. Key subsystems: flight controller (IMU + GPS + barometer + Pixhawk/ArduPilot), ESC (Electronic Speed Controller), battery, telemetry.
Key relationships: FAA Part 107 regulations (US: <25 kg, <400 ft AGL, within visual line of sight — VLOS), BVLOS waiver, UTM (UAS Traffic Management), geofencing, return-to-home (RTH), sense-and-avoid.

**C22 — Reinforcement Learning in Robotics**
Definition: Training robot control policies through trial-and-error interaction with an environment, maximizing cumulative reward. Sim-to-real transfer: train in simulation (MuJoCo, Isaac Gym), deploy to physical robot. Key methods: PPO (Proximal Policy Optimization), SAC (Soft Actor-Critic), model-based RL. Applications: dexterous manipulation, legged locomotion (Boston Dynamics, ETH Zürich ANYmal), object grasping.
Key relationships: Policy gradient, Q-learning, exploration-exploitation trade-off, reward engineering, domain randomization (simulation variability to improve sim-to-real transfer), curriculum learning, real-world sample efficiency challenge.

**C23 — Soft Robotics**
Definition: Robots constructed from compliant, deformable materials (silicone, hydrogels, fabrics) rather than rigid structures, enabling inherent mechanical compliance and safety. Actuation: pneumatic (inflating chambers — PneuNets), tendon-driven, shape memory alloy (SMA), dielectric elastomer. Applications: medical (endoscopes, exosuits), food handling, search-and-rescue, inspection.
Key relationships: Compliance (inverse of stiffness), continuum mechanics, hyperelastic materials, variable stiffness mechanisms, gecko-inspired adhesion, bio-inspired design (octopus, caterpillar).

**C24 — Human-Robot Interaction (HRI)**
Definition: Research and practice of designing effective and safe interactions between humans and robots. Physical HRI (pHRI): direct contact, safety critical. Social HRI: communication, expression, trust, acceptance. Proxemics: social distance zones (intimate <0.5m, personal 0.5–1.2m, social 1.2–3.6m, public >3.6m). Uncanny valley: humanoid robots that appear nearly-but-not-perfectly human provoke discomfort.
Key relationships: Trust calibration (over-trust causes accidents, under-trust reduces utility), situation awareness, transparency (robot communicating intentions), explainability, legibility (motion readable by humans), gesture/gaze communication.

**C25 — Robot Ethics and Governance**
Definition: Emerging frameworks for ethical deployment of robots: accountability (who is liable when a robot causes harm), transparency (algorithmic decisions understandable), privacy (robot sensing in homes/workplaces), safety certification (ISO, IEC, FDA for medical), military autonomy (Lethal Autonomous Weapons Systems — LAWS, UN discussions), labor displacement ethics.
Key relationships: IEEE Ethically Aligned Design, EU AI Act (classifying robotic AI by risk level), Product Liability Directive (EU), ISO 9283 (robot performance measurement), LAWS debate (Campaign to Stop Killer Robots), collaborative robot safety standards (ISO/TS 15066).

---

## 5. Patterns

**P01 — Robot System Integration (V-Model)**
Description: Requirements → System design → Subsystem design → Implementation → Unit test → Integration test → System test → Validation; trace requirements to tests; validate each level before integrating; use simulation at higher levels to reduce physical testing cost.
When to use: All new robot system development; safety-critical applications.
Example: Surgical robot development: system requirements (accuracy <0.5mm, force limit <10N) → subsystem (joint control, vision subsystem) → implementation → unit tests (servo tracking) → integration (full system kinematics) → clinical validation (cadaver study, IRB-approved).

**P02 — Robot Calibration**
Description: Identify and correct geometric errors (link length, joint offset, joint angle zero) by measuring end-effector positions at multiple configurations; solve optimization (least squares) for calibration parameters; verify residual error after calibration; recalibrate on schedule or after maintenance.
When to use: Before robot deployment for precision tasks; after collision or major maintenance.
Example: 6-DOF welding robot: 25-point calibration using laser tracker (Leica AT960); initial positional accuracy 2.5 mm → post-calibration 0.4 mm; within ISO 9283 repeatability specification (±0.05 mm at rated payload).

**P03 — SLAM Implementation Workflow**
Description: Select SLAM algorithm matching sensor suite and environment (LiDAR-SLAM for large outdoor, VSLAM for indoor without LiDAR, wheel odometry + LiDAR for warehouse AMR); map building phase (systematic coverage); loop closure validation; localization in saved map; update policy for map changes.
When to use: Autonomous mobile robot deployment in new environment.
Example: Warehouse AMR deployment: Cartographer 2D LiDAR SLAM; map building run (systematic coverage in 45 min); occupancy grid exported; map zones annotated (restricted, loading dock, charge station); localization RMSE <5 cm in saved map.

**P04 — Motion Planning with MoveIt (ROS)**
Description: Define robot URDF + SRDF (semantic robot description: planning groups, end-effectors, virtual joints); configure motion planner (OMPL: RRTConnect, RRTstar, CHOMP); set joint limits and velocity/acceleration limits; plan collision-free trajectories via MoveGroupInterface API; execute with trajectory controller; monitor execution with joint state feedback.
When to use: Manipulation robot programming in ROS ecosystem.
Example: 7-DOF KUKA LBR iiwa with MoveIt: plan pick-and-place trajectory; RRTConnect solves in <200ms; trajectory smoothed by TOPP-RA (Time-Optimal Path Parameterization); executed at 70% velocity for safety validation.

**P05 — Cobot Risk Assessment (ISO 10218)**
Description: Identify hazards (motion, force, sharp edges, payload drop, workspace intrusion); assess risk (severity × probability × avoidance); apply protection measures (PFL limits, guarding, safety-rated stop); residual risk acceptable? Document in risk assessment report; CE mark or OSHA compliance; periodic review.
When to use: Any cobot deployment; regulatory compliance; before any new application.
Example: UR10e cobot with metal part assembly: risk assessment identifies pinch point at fixture (severity: moderate, probability: occasional); implement TCP force limit 100N; add safety-rated zone scanner (50 cm protective field); residual risk acceptable per ISO 10218-2.

**P06 — PID Tuning Procedure**
Description: Set Ki = Kd = 0; increase Kp until steady oscillation (ultimate gain Ku); set Kp = 0.6 Ku, Ki = 2Kp/Tu, Kd = KpTu/8 (Ziegler-Nichols); refine by testing step response (minimize overshoot, settling time, steady-state error); add anti-windup for integrator; add derivative filter; validate at all operating conditions.
When to use: Motor and joint controller tuning; new actuator integration.
Example: Joint controller for 6 kg payload arm link: Kp tuned to 250, Ki to 45 (eliminates 0.2° steady-state error at rated payload), Kd to 8 with 50 Hz low-pass filter; step response: 90 ms settling time, <5% overshoot — within spec.

**P07 — Drone Flight Test Protocol**
Description: Pre-flight: check battery, propellers, firmware, GPS lock, VLOS conditions, airspace (NOTAM check, geofence verification); arm and hover-test at low altitude (1 m, 30 s); expand to operational altitude; test emergency stop/RTH; full mission test at reduced speed; log review post-flight; document anomalies.
When to use: Any UAV/drone flight operation; new aircraft maiden flight.
Example: Inspection drone for transmission tower: Part 107 operator authorization; NOTAM filed; DJI Matrice 300 RTK; 30 m altitude; pre-flight checklist complete; RTH tested; grid pattern inspection at 5 m/s; post-flight log shows one GPS spike → investigate module.

---

## 6. Anti-Patterns

**AP01 — Ignoring Singularities in Trajectory Planning**
Why wrong: Singularities (configurations where the Jacobian loses rank) cause unpredictable behavior: loss of controllability in some directions, infinite joint velocities for finite Cartesian velocities, or control law breakdown. Planned trajectories that pass through or near singularities can cause joint velocity spikes, collisions, or control failure.
What to do instead: Check trajectory for proximity to singularities (condition number of Jacobian); apply damped least squares (DLS) regularization for near-singular configurations; plan trajectories avoiding singular configurations; use redundancy resolution for 7+ DOF robots.

**AP02 — Designing for Average Human Rather Than Range**
Why wrong: Robot workstations designed for the "average" operator exclude 50% of workers. Ergonomic and safety requirements apply to the 5th–95th percentile human range. Fixed-height robot tables designed for average height cause ergonomic problems for shorter or taller operators; HRI contact force limits must protect the most vulnerable users.
What to do instead: Design for the full anthropometric range of intended operators; apply human factors standards (ISO 9241, HFES guidelines); adjust workcell height, reach, force limits, and interaction modalities for user diversity.

**AP03 — Underestimating Sim-to-Real Gap**
Why wrong: Robots trained in simulation often fail in the real world because simulation models imperfect physics (contact dynamics, friction, sensor noise, actuator delays, material properties). Assuming simulated performance will transfer directly leads to overconfident deployment and dangerous failures.
What to do instead: Apply domain randomization (vary physical parameters in simulation); use system identification (measure real robot dynamics); validate extensively on physical hardware in progressively more realistic conditions; treat sim-to-real transfer as a fundamental engineering challenge.

**AP04 — Neglecting Failure Modes in Autonomous Systems**
Why wrong: Autonomous robots operating in uncontrolled environments will inevitably encounter situations outside their training/design envelope (unknown objects, sensor failure, edge cases, adversarial conditions). Designing only for the nominal case produces systems that fail unsafely when the unexpected occurs.
What to do instead: Implement comprehensive fault detection (sensor plausibility checks, state estimator divergence detection); design safe failure modes (safe-stop, human escalation, conservative fallback behaviors); conduct structured failure modes and effects analysis (FMEA); test adversarial scenarios explicitly.

**AP05 — Applying Industrial Robot Force Levels to Collaborative Deployments**
Why wrong: Industrial robots operate at high speeds and forces that cause serious injury on human contact. Applying industrial robot parameters (even at lower speeds) in collaborative settings without proper risk assessment and force limiting violates ISO/TS 15066 and can cause severe harm — speed alone does not make a robot safe for contact.
What to do instead: Conduct biomechanical risk assessment per ISO/TS 15066 Annex A; verify force and pressure limits at all contact scenarios; implement safety-rated force monitoring; use cobots specifically designed for collaborative use or add certified safety systems to industrial arms.

**AP06 — Over-Engineering Robot Perception for Structured Environments**
Why wrong: Deploying complex deep learning perception pipelines in highly structured environments (fixed-position pallets, controlled lighting, uniform backgrounds) when simpler, faster, more reliable methods (fiducial markers, fixed cameras with calibrated positions, template matching) achieve sufficient performance adds unnecessary complexity, cost, and failure modes.
What to do instead: Match perception solution complexity to environment complexity; use 2D barcode/fiducial (AprilTag, ArUco) for structured setups; reserve deep learning for unstructured environments; validate perception reliability across the full range of expected conditions.

**AP07 — Ignoring Long-Term Maintenance in Robot Deployment**
Why wrong: Industrial robots have 5–15 year lifespans; grease replacement (every 4,000–6,000 hours), brake inspection, cable replacement, and firmware updates are mandatory. Deploying robots without maintenance planning and trained technicians leads to premature failure, safety incidents, and production downtime.
What to do instead: Include total cost of ownership (TCO) analysis covering maintenance in acquisition; train maintenance technicians; establish PM (preventive maintenance) schedule per OEM specifications; track joint hours, thermal history, and service intervals; budget for spare parts.

---

## 7. Facts & Descriptors

| Fact ID | Statement | Category | Confidence |
|---|---|---|---|
| F001 | Global robot installations: ~553,052 industrial robots installed in 2023 (IFR World Robotics Report); robot density: 162 robots per 10,000 manufacturing workers globally; South Korea leads at 1,012/10,000. | Industry | Very High |
| F002 | The first industrial robot was UNIMATE (George Devol, 1961): installed at GM Ewing Township plant, NJ; performed die casting extraction — a hazardous, hot task. | History | Very High |
| F003 | Intuitive Surgical da Vinci system: over 8 million procedures performed globally (cumulative to 2023); installed base >8,000 systems; ~$3,400 million annual revenue (2023). | Medical | Very High |
| F004 | Boston Dynamics Atlas: hydraulic humanoid capable of backflips, parkour, and complex manipulation; transitioned to electric actuators (2024 new Atlas); used primarily for R&D, not commercial deployment. | Robotics | Very High |
| F005 | The global robotics market: ~$62 billion (2023); projected to grow to ~$165 billion by 2030; collaborative robots (cobots) fastest growing segment at ~40% annual growth. | Economics | High |
| F006 | Amazon Robotics (formerly Kiva, acquired 2012 for $775M): deploys >750,000 AMRs in Amazon fulfillment centers; demonstrated that robotic fulfillment can handle peak holiday demand at scale. | Industry | Very High |
| F007 | PID control: ~95% of industrial control loops use PID controllers; despite being developed in the 1930s (Ziegler-Nichols tuning rules, 1942), PID remains the dominant industrial control algorithm. | Control | Very High |
| F008 | FAA Part 107 (US small UAS rule, 2016): requires remote pilot certificate; restricts flights to <400 ft AGL, <100 mph, daylight, VLOS; does not require aircraft registration below 250g; BVLOS requires waiver. | Regulation | Very High |
| F009 | Boston Dynamics Spot robot dog: 4-legged, ~32 kg; IP54 dust/water resistance; battery life ~90 min; used for industrial inspection, security, disaster response; available for purchase/lease; $74,500 base price (2021). | Robotics | High |
| F010 | ROS (Robot Operating System) originated at Willow Garage (2007, Stanford); ROS 2 released 2017; adopted by >55% of robot projects (2023 survey); hosts >3,000 packages; used in industry, research, and education. | Software | Very High |
| F011 | FANUC (Japan): world's largest robot manufacturer by installed base; produces ~25,000 robots/month at fully automated factory (robots make robots); 2024 cumulative installations exceeded 700,000 globally. | Industry | Very High |
| F012 | Tesla Optimus (humanoid robot, 2022 prototype, 2025 production target): designed for general manufacturing tasks; uses actuators derived from Tesla EV development; illustrates big-tech entry into humanoid robotics. | Emerging | High |
| F013 | The DARPA Robotics Challenge (DRC, 2015): tested autonomous and semi-autonomous robots on disaster response tasks (valve turning, driving, debris clearing, stair climbing); robots took 45+ minutes to complete 8 tasks; revealed gap between capabilities and human performance. | History | Very High |
| F014 | Drone delivery market: Wing (Alphabet) completed 350,000+ deliveries by 2023; Amazon Prime Air in limited trial; noise, airspace management, and regulation remain key barriers to scale. | Drones | High |
| F015 | Universal Robots (UR): founded 2005 (Denmark), acquired by Teradyne 2015 for $285M; market leader in collaborative robots; UR5e, UR10e most popular models; 75,000+ cobots installed globally by 2023. | Industry | Very High |
| F016 | Surgical robot training: da Vinci surgeons require specialized certification; studies show 100–250 procedure learning curve before outcomes match open surgery; robotic surgery outcomes superior to open for some procedures (radical prostatectomy). | Medical | High |
| F017 | Reinforcement learning for locomotion: ETH Zürich trained ANYmal legged robot to traverse terrain (stairs, gravel, obstacles) using RL in simulation; transferred to real hardware — milestone in learned locomotion (2020). | AI | Very High |
| F018 | Robot precision: best industrial robots achieve repeatability of ±0.01 mm (e.g., FANUC M-3iA/6A, KUKA KR AGILUS); absolute accuracy after calibration ~±0.1 mm; medical robots achieve <0.5 mm for orthopedic cutting. | Performance | Very High |
| F019 | Autonomous vehicles as robots: a self-driving car is a mobile robot with a specialized domain; SAE Level 3 vehicles (conditional automation) are in limited commercial operation (Mercedes S-class EQS in some markets, 2023). | Autonomous | Very High |
| F020 | MuJoCo (Multi-Joint dynamics with Contact): physics simulation engine (DeepMind, open-sourced 2022); dominant simulation environment for robot learning research; provides accurate contact dynamics critical for manipulation research. | Software | Very High |
| F021 | LIDAR cost reduction: Velodyne VLP-16 (2016): ~$8,000; equivalent performance solid-state LiDARs (2024): <$500; 16× cost reduction in 8 years — enabling broader adoption in mobile robots and autonomous vehicles. | Technology | High |
| F022 | Exoskeleton robots: Ekso Bionics, ReWalk, Indego (Parker Hannifin) for medical rehabilitation; Sarcos, SuitX for industrial exoskeletons reducing ergonomic injury; FDA-cleared for spinal cord injury rehabilitation. | Medical | High |
| F023 | The three laws of robotics (Isaac Asimov, 1942): (1) A robot may not injure a human or allow a human to be harmed by inaction; (2) A robot must obey orders unless conflicting with (1); (3) A robot must protect its existence unless conflicting with (1) or (2); remain conceptually influential but do not map to real engineering requirements. | History | Very High |
| F024 | Deep learning for grasping: Google Robotic Grasping (2016, Levine et al.): trained grasping policy on 800,000 physical trials across multiple robots; demonstrated data-driven grasping generalization — launched modern era of learning-based manipulation. | AI | Very High |
| F025 | Warehouse robotics: Symbotic (Walmart partner): AI-driven warehouse automation system; Ocado (UK grocery): highly automated robot fulfillment center; Amazon warehouse: $1,000 saved per hour of robot work at scale (management estimate). | Industry | High |
| F026 | The ISO 9283 standard: specifies methods for measuring industrial robot performance: pose accuracy, pose repeatability, path accuracy, path repeatability, velocity performance, and static compliance. | Standards | Very High |
| F027 | Cambridge Consultants estimated that robots perform 10% of all manufacturing tasks (2019); projection: 25% by 2025; fully automated manufacturing remains limited to very specific, structured industries. | Industry | Medium |
| F028 | Hydraulic robots vs. electric: hydraulic (Boston Dynamics old Atlas, Spot original): high power density, compliant, good for locomotion; electric (modern trend: UR cobots, KUKA, ABB): cleaner, quieter, more precise, easier to control; most new designs are electric. | Technology | Very High |
| F029 | The NASA Mars rovers (Spirit, Opportunity, Curiosity, Perseverance): fully autonomous mobile robots operating under 8–20 minute communication delay; must navigate, plan, and survive without real-time human control; Perseverance (2021) includes Ingenuity helicopter — first powered flight on another planet. | Space | Very High |
| F030 | Humanoid robot market: Figure AI, Agility Robotics (Digit, Amazon partnership), Apptronik, 1X Technologies, Tesla Optimus competing for general-purpose humanoid market; investment >$2 billion raised in 2023 alone; practical deployment 5–10 years away for most experts. | Emerging | High |

*Cross-references: Computer Science pack (machine learning, software engineering), Mechanical Engineering pack (mechanisms, materials), Telecommunications pack (robot-to-cloud communication, 5G for industrial robotics), Medicine pack (surgical applications, medical device regulation).*

*Pack integrity: 25 core concepts, 7 patterns, 7 anti-patterns, 30 facts. All 10 invariants satisfied.*
*Version 1.0 — DarkWave Studios LLC — AXIOM Engine*
