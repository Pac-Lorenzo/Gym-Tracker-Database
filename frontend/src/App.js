import React, { useState, useEffect } from "react";
import { createUser, createWorkout, getPRs, getAllUsers, getWorkouts, getExercises, deleteUser, deleteWorkout, getExerciseLibrary, addGlobalExercise, addUserCustomExercise, deleteUserCustomExercise, deleteGlobalExercise, getTemplateLibrary, getTemplate, createTemplate, deleteTemplate } from "./api";

function App() {
  const [userId, setUserId] = useState("");
  const [newUser, setNewUser] = useState({ name: "", email: "", age: "", weight_lbs: "" });

  const [workout, setWorkout] = useState({
    user_id: "",
    total_time_minutes: "",
    exercises: [
      {
        exercise_id: "",
        name: "",
        is_custom: false,
        sets: [
          { set_id: "set1", weight: "", reps: "", difficulty: "" }
        ]
      }
    ]
  });
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [useCustomExercise, setUseCustomExercise] = useState(false);

  const [prs, setPRs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [exerciseLibrary, setExerciseLibrary] = useState({ global: [], custom: [], combined: [] });
  const [templateLibrary, setTemplateLibrary] = useState({ global: [], custom: [], combined: [] });
  const [selectedUserName, setSelectedUserName] = useState("");
  const [newExercise, setNewExercise] = useState({ name: "", type: "Strength", muscle_groups: "", addToGlobal: false });
  const [newTemplate, setNewTemplate] = useState({ name: "", exercises: [], addToGlobal: false });
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  // Load exercises on mount
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const res = await getExercises();
        setExercises(res.data);
      } catch (error) {
        console.error("Error loading exercises:", error);
      }
    };
    loadExercises();
  }, []);

  // Load exercise library and templates when user is selected
  useEffect(() => {
    if (userId) {
      loadExerciseLibrary();
      loadTemplateLibrary();
    }
  }, [userId]);

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      const res = await getAllUsers();
      setAllUsers(res.data);
    } catch (error) {
      alert("Error loading users: " + (error.response?.data?.error || error.message));
    }
  };

  // Load exercise library (global + user custom)
  const loadExerciseLibrary = async () => {
    if (!userId) return;
    try {
      const res = await getExerciseLibrary(userId);
      setExerciseLibrary(res.data);
      // Update exercises list for dropdown (combined)
      setExercises(res.data.combined);
    } catch (error) {
      console.error("Error loading exercise library:", error);
    }
  };

  // Load template library (global + user custom)
  const loadTemplateLibrary = async () => {
    if (!userId) return;
    try {
      const res = await getTemplateLibrary(userId);
      setTemplateLibrary(res.data);
    } catch (error) {
      console.error("Error loading template library:", error);
    }
  };

  // Select user
  const handleUserSelect = (user) => {
    setUserId(user._id);
    setSelectedUserName(user.name);
    setPRs([]);
    setWorkouts([]);
    loadExerciseLibrary();
    loadTemplateLibrary();
  };

  // Fetch workouts for selected user
  const fetchWorkouts = async () => {
    if (!userId) {
      alert("Please select a user first!");
      return;
    }
    try {
      const res = await getWorkouts(userId);
      setWorkouts(res.data);
    } catch (error) {
      alert("Error loading workouts: " + (error.response?.data?.error || error.message));
    }
  };

  // Get exercise name by ID
  const getExerciseName = (exerciseId) => {
    const exercise = exercises.find(ex => ex.exercise_id === exerciseId);
    return exercise ? exercise.name : exerciseId;
  };

  // Create User
  const handleUserCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createUser(newUser);
      setUserId(res.data._id);
      setSelectedUserName(res.data.name);
      setNewUser({ name: "", email: "", age: "", weight_lbs: "" });
      alert("User created! ID: " + res.data._id);
      // Refresh users list
      fetchAllUsers();
    } catch (error) {
      alert("Error creating user: " + (error.response?.data?.error || error.message));
    }
  };

  // Create Workout
  const handleWorkoutSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("Please create a user first!");
      return;
    }
    // Validate all exercises have exercise_id and name
    const invalidExercises = workout.exercises.filter(ex => !ex.exercise_id || !ex.name);
    if (invalidExercises.length > 0) {
      alert("Please select an exercise for all exercises in the workout!");
      return;
    }
    try {
      const workoutToSubmit = { 
        ...workout, 
        user_id: userId,
        exercises: workout.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(set => ({
            ...set,
            weight: Number(set.weight) || 0,
            reps: Number(set.reps) || 0,
            difficulty: Number(set.difficulty) || 0
          }))
        }))
      };
      const res = await createWorkout(workoutToSubmit);
      alert("Workout logged!");
      // Clear form
      setWorkout({
        user_id: "",
        total_time_minutes: "",
        exercises: [{
          exercise_id: "",
          name: "",
          is_custom: false,
          sets: [{ set_id: "set1", weight: "", reps: "", difficulty: "" }]
        }]
      });
      setSelectedTemplateId("");
      setUseCustomExercise(false);
      setCustomExerciseName("");
      // Refresh PRs, workouts, and library
      fetchPRs();
      fetchWorkouts();
      loadExerciseLibrary();
    } catch (error) {
      alert("Error logging workout: " + (error.response?.data?.error || error.message));
    }
  };

  // Load PRs
  const fetchPRs = async () => {
    if (!userId) {
      alert("Please create a user first!");
      return;
    }
    try {
      const res = await getPRs(userId);
      setPRs(res.data);
    } catch (error) {
      alert("Error loading PRs: " + (error.response?.data?.error || error.message));
    }
  };

  // Delete User
  const handleDeleteUser = async (userIdToDelete, e) => {
    e.stopPropagation(); // Prevent selecting the user when clicking delete
    if (!window.confirm("Are you sure you want to delete this user? This will also delete all their workouts and PRs.")) {
      return;
    }
    try {
      await deleteUser(userIdToDelete);
      alert("User deleted successfully!");
      // If deleted user was selected, clear selection
      if (userId === userIdToDelete) {
        setUserId("");
        setSelectedUserName("");
        setPRs([]);
        setWorkouts([]);
      }
      // Refresh users list
      fetchAllUsers();
    } catch (error) {
      alert("Error deleting user: " + (error.response?.data?.error || error.message));
    }
  };

  // Delete Workout
  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm("Are you sure you want to delete this workout?")) {
      return;
    }
    try {
      await deleteWorkout(workoutId);
      alert("Workout deleted successfully!");
      // Refresh workouts and PRs
      fetchWorkouts();
      fetchPRs();
    } catch (error) {
      alert("Error deleting workout: " + (error.response?.data?.error || error.message));
    }
  };

  // Handle exercise selection change
  const handleExerciseChange = (e) => {
    const selectedExerciseId = e.target.value;
    if (selectedExerciseId === "custom") {
      setUseCustomExercise(true);
      setWorkout({
        ...workout,
        exercises: [{
          ...workout.exercises[0],
          exercise_id: "",
          name: "",
          is_custom: true
        }]
      });
    } else {
      setUseCustomExercise(false);
      const selectedExercise = exercises.find(ex => ex.exercise_id === selectedExerciseId);
      if (selectedExercise) {
        setWorkout({
          ...workout,
          exercises: [{
            ...workout.exercises[0],
            exercise_id: selectedExercise.exercise_id,
            name: selectedExercise.name,
            is_custom: false
          }]
        });
      }
    }
  };

  // Handle custom exercise name change
  const handleCustomExerciseNameChange = async (e) => {
    const name = e.target.value;
    setCustomExerciseName(name);
    // Generate a custom exercise_id for custom exercises
    const customId = "custom_" + name.toLowerCase().replace(/\s+/g, "_");
    setWorkout({
      ...workout,
      exercises: [{
        ...workout.exercises[0],
        exercise_id: customId,
        name: name,
        is_custom: true
      }]
    });
    
    // Auto-save custom exercise to user's library if user is selected and name is valid
    if (userId && name.trim().length > 0) {
      try {
        await addUserCustomExercise(userId, {
          exercise_id: customId,
          name: name,
          type: "Custom"
        });
        // Reload library to update dropdown
        loadExerciseLibrary();
      } catch (error) {
        // Silently fail if exercise already exists or other error
        console.log("Auto-save note:", error.response?.data?.error || "Exercise may already exist");
      }
    }
  };

  // Add exercise to library (global or user)
  const handleAddExercise = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("Please select a user first!");
      return;
    }
    
    try {
      const exerciseData = {
        name: newExercise.name,
        type: newExercise.type,
        muscle_groups: newExercise.muscle_groups.split(',').map(g => g.trim()).filter(g => g)
      };
      
      if (newExercise.addToGlobal) {
        await addGlobalExercise(exerciseData);
        alert("Exercise added to global library!");
      } else {
        await addUserCustomExercise(userId, exerciseData);
        alert("Exercise added to your library!");
      }
      
      // Clear form and reload
      setNewExercise({ name: "", type: "Strength", muscle_groups: "", addToGlobal: false });
      loadExerciseLibrary();
      const res = await getExercises();
      setExercises(res.data);
    } catch (error) {
      alert("Error adding exercise: " + (error.response?.data?.error || error.message));
    }
  };

  // Delete user custom exercise
  const handleDeleteCustomExercise = async (exerciseId) => {
    if (!window.confirm("Are you sure you want to remove this exercise from your library?")) {
      return;
    }
    try {
      await deleteUserCustomExercise(userId, exerciseId);
      alert("Exercise removed from your library!");
      loadExerciseLibrary();
    } catch (error) {
      alert("Error deleting exercise: " + (error.response?.data?.error || error.message));
    }
  };

  // Delete global exercise
  const handleDeleteGlobalExercise = async (exerciseId) => {
    if (!window.confirm("Are you sure you want to delete this exercise from the global library? All users will lose access to it.")) {
      return;
    }
    try {
      await deleteGlobalExercise(exerciseId);
      alert("Exercise deleted from global library!");
      loadExerciseLibrary();
      const res = await getExercises();
      setExercises(res.data);
    } catch (error) {
      alert("Error deleting exercise: " + (error.response?.data?.error || error.message));
    }
  };

  // Load template into workout form
  const handleLoadTemplate = async (templateId) => {
    if (!templateId) {
      // Clear template
      setWorkout({
        ...workout,
        exercises: [{
          exercise_id: "",
          name: "",
          is_custom: false,
          sets: [{ set_id: "set1", weight: "", reps: "", difficulty: "" }]
        }]
      });
      setSelectedTemplateId("");
      return;
    }
    try {
      const res = await getTemplate(templateId);
      const template = res.data;
      // Convert template exercises to workout format
      const workoutExercises = template.exercises.map((ex, idx) => {
        const exercise = exerciseLibrary.combined.find(e => e.exercise_id === ex.exercise_id);
        return {
          exercise_id: ex.exercise_id,
          name: exercise ? exercise.name : ex.exercise_id,
          is_custom: exercise ? exercise.is_custom : false,
          sets: [{ set_id: `set1`, weight: "", reps: "", difficulty: "" }]
        };
      });
      setWorkout({
        ...workout,
        exercises: workoutExercises.length > 0 ? workoutExercises : [{
          exercise_id: "",
          name: "",
          is_custom: false,
          sets: [{ set_id: "set1", weight: "", reps: "", difficulty: "" }]
        }]
      });
      setSelectedTemplateId(templateId);
    } catch (error) {
      alert("Error loading template: " + (error.response?.data?.error || error.message));
    }
  };

  // Add exercise to workout
  const handleAddExerciseToWorkout = () => {
    setWorkout({
      ...workout,
      exercises: [...workout.exercises, {
        exercise_id: "",
        name: "",
        is_custom: false,
        sets: [{ set_id: `set${Date.now()}`, weight: "", reps: "", difficulty: "" }]
      }]
    });
  };

  // Remove exercise from workout
  const handleRemoveExerciseFromWorkout = (index) => {
    if (workout.exercises.length <= 1) {
      alert("Workout must have at least one exercise!");
      return;
    }
    setWorkout({
      ...workout,
      exercises: workout.exercises.filter((_, i) => i !== index)
    });
  };

  // Update exercise in workout
  const handleUpdateExerciseInWorkout = (index, field, value) => {
    const updatedExercises = [...workout.exercises];
    if (field === 'exercise_id') {
      const selectedExercise = exerciseLibrary.combined.find(ex => ex.exercise_id === value);
      if (selectedExercise) {
        updatedExercises[index] = {
          ...updatedExercises[index],
          exercise_id: selectedExercise.exercise_id,
          name: selectedExercise.name,
          is_custom: selectedExercise.is_custom || false
        };
      }
    } else {
      updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    }
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  // Update set in workout exercise
  const handleUpdateSet = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...workout.exercises];
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  // Add set to exercise
  const handleAddSet = (exerciseIndex) => {
    const updatedExercises = [...workout.exercises];
    updatedExercises[exerciseIndex].sets.push({
      set_id: `set${Date.now()}`,
      weight: "",
      reps: "",
      difficulty: ""
    });
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  // Remove set from exercise
  const handleRemoveSet = (exerciseIndex, setIndex) => {
    const updatedExercises = [...workout.exercises];
    if (updatedExercises[exerciseIndex].sets.length <= 1) {
      alert("Exercise must have at least one set!");
      return;
    }
    updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  // Create template
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("Please select a user first!");
      return;
    }
    if (!newTemplate.name || newTemplate.exercises.length === 0) {
      alert("Template must have a name and at least one exercise!");
      return;
    }
    try {
      const templateData = {
        name: newTemplate.name,
        exercises: newTemplate.exercises.map((ex, idx) => ({
          exercise_id: ex.exercise_id,
          order: idx + 1
        })),
        is_global: newTemplate.addToGlobal,
        user_id: newTemplate.addToGlobal ? null : userId
      };
      await createTemplate(templateData);
      alert(`Template ${newTemplate.addToGlobal ? 'added to global library' : 'created'}!`);
      setNewTemplate({ name: "", exercises: [], addToGlobal: false });
      loadTemplateLibrary();
    } catch (error) {
      alert("Error creating template: " + (error.response?.data?.error || error.message));
    }
  };

  // Add exercise to template being created
  const handleAddExerciseToTemplate = (exerciseId) => {
    const exercise = exerciseLibrary.combined.find(ex => ex.exercise_id === exerciseId);
    if (exercise && !newTemplate.exercises.find(ex => ex.exercise_id === exerciseId)) {
      setNewTemplate({
        ...newTemplate,
        exercises: [...newTemplate.exercises, {
          exercise_id: exercise.exercise_id,
          name: exercise.name
        }]
      });
    }
  };

  // Remove exercise from template being created
  const handleRemoveExerciseFromTemplate = (index) => {
    setNewTemplate({
      ...newTemplate,
      exercises: newTemplate.exercises.filter((_, i) => i !== index)
    });
  };

  // Delete template
  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }
    try {
      await deleteTemplate(templateId);
      alert("Template deleted successfully!");
      loadTemplateLibrary();
      if (selectedTemplateId === templateId) {
        handleLoadTemplate("");
      }
    } catch (error) {
      alert("Error deleting template: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>GymTracker Demo</h2>
      {selectedUserName && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
          <strong>Selected User:</strong> {selectedUserName} (ID: {userId})
        </div>
      )}

      {/* Create User */}
      <section style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>Create User</h3>
        <form onSubmit={handleUserCreate} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input placeholder="Name" value={newUser.name} onChange={(e)=>setNewUser({...newUser,name:e.target.value})} style={{ padding: '8px' }} />
          <input placeholder="Email" value={newUser.email} onChange={(e)=>setNewUser({...newUser,email:e.target.value})} style={{ padding: '8px' }} />
          <input placeholder="Age" type="number" value={newUser.age} onChange={(e)=>setNewUser({...newUser,age:e.target.value})} style={{ padding: '8px' }} />
          <input placeholder="Weight (lbs)" type="number" value={newUser.weight_lbs} onChange={(e)=>setNewUser({...newUser,weight_lbs:e.target.value})} style={{ padding: '8px' }} />
          <button type="submit" style={{ padding: '8px 15px' }}>Create User</button>
        </form>
      </section>

      {/* Log Workout */}
      <section style={{ marginTop: '30px', border: '1px solid #ddd', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>Log Workout</h3>
        {!userId && <p style={{ color: '#f44336' }}>Please select or create a user first!</p>}
        <form onSubmit={handleWorkoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Template Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>Select Template (Optional):</label>
            <select 
              value={selectedTemplateId} 
              onChange={(e) => handleLoadTemplate(e.target.value)}
              style={{ padding: '8px', width: '300px' }}
              disabled={!userId}
            >
              <option value="">-- Start from Scratch --</option>
              {templateLibrary.combined && templateLibrary.combined.length > 0 ? (
                <>
                  <optgroup label="Global Templates">
                    {templateLibrary.global.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                  {templateLibrary.custom.length > 0 && (
                    <optgroup label="My Templates">
                      {templateLibrary.custom.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </>
              ) : null}
            </select>
          </div>

          {/* Total Time */}
          <div>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Total Time (minutes):</label>
            <input 
              type="number"
              value={workout.total_time_minutes}
              onChange={(e)=> setWorkout({...workout, total_time_minutes: e.target.value})}
              style={{ padding: '8px', width: '150px' }}
            />
          </div>

          {/* Exercises */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>Exercises:</label>
              <button type="button" onClick={handleAddExerciseToWorkout} style={{ padding: '5px 10px', fontSize: '0.9em' }}>
                + Add Exercise
              </button>
            </div>
            {workout.exercises.map((exercise, exIdx) => (
              <div key={exIdx} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong>Exercise {exIdx + 1}</strong>
                  <button type="button" onClick={() => handleRemoveExerciseFromWorkout(exIdx)} style={{ padding: '3px 8px', fontSize: '0.8em', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '3px' }}>
                    Remove
                  </button>
                </div>
                <select 
                  value={exercise.exercise_id || ""} 
                  onChange={(e) => handleUpdateExerciseInWorkout(exIdx, 'exercise_id', e.target.value)}
                  style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
                >
                  <option value="">-- Select Exercise --</option>
                  {exerciseLibrary.combined && exerciseLibrary.combined.map((ex) => (
                    <option key={ex.exercise_id} value={ex.exercise_id}>
                      {ex.name} {ex.is_custom && '(Custom)'}
                    </option>
                  ))}
                </select>
                
                {/* Sets for this exercise */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '0.9em' }}>Sets:</label>
                    <button type="button" onClick={() => handleAddSet(exIdx)} style={{ padding: '3px 8px', fontSize: '0.8em' }}>
                      + Add Set
                    </button>
                  </div>
                  {exercise.sets.map((set, setIdx) => (
                    <div key={setIdx} style={{ display: 'flex', gap: '10px', marginBottom: '5px', alignItems: 'center' }}>
                      <span style={{ width: '40px', fontSize: '0.9em' }}>Set {setIdx + 1}:</span>
                      <input 
                        placeholder="Weight (lbs)" 
                        type="number"
                        value={set.weight}
                        onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weight', e.target.value)}
                        style={{ padding: '5px', width: '100px' }}
                      />
                      <input 
                        placeholder="Reps" 
                        type="number"
                        value={set.reps}
                        onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', e.target.value)}
                        style={{ padding: '5px', width: '80px' }}
                      />
                      <input 
                        placeholder="Difficulty 1-10" 
                        type="number" 
                        min="1" 
                        max="10"
                        value={set.difficulty}
                        onChange={(e) => handleUpdateSet(exIdx, setIdx, 'difficulty', e.target.value)}
                        style={{ padding: '5px', width: '100px' }}
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSet(exIdx, setIdx)}
                        style={{ padding: '3px 8px', fontSize: '0.8em', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '3px' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button 
            type="submit" 
            disabled={!userId || workout.exercises.some(ex => !ex.exercise_id || !ex.name)} 
            style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Submit Workout
          </button>
        </form>
      </section>

      {/* Add Exercise to Library */}
      <section style={{ marginTop: '30px', border: '1px solid #ddd', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>Add Exercise to Library</h3>
        {!userId && <p style={{ color: '#f44336' }}>Please select or create a user first!</p>}
        <form onSubmit={handleAddExercise} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input 
              placeholder="Exercise Name" 
              value={newExercise.name}
              onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
              style={{ padding: '8px', width: '200px' }}
              required
            />
            <select
              value={newExercise.type}
              onChange={(e) => setNewExercise({...newExercise, type: e.target.value})}
              style={{ padding: '8px', width: '150px' }}
            >
              <option value="Strength">Strength</option>
              <option value="Cardio">Cardio</option>
              <option value="Flexibility">Flexibility</option>
              <option value="Custom">Custom</option>
            </select>
            <input 
              placeholder="Muscle Groups (comma separated)" 
              value={newExercise.muscle_groups}
              onChange={(e) => setNewExercise({...newExercise, muscle_groups: e.target.value})}
              style={{ padding: '8px', width: '250px' }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input 
                type="checkbox"
                checked={newExercise.addToGlobal}
                onChange={(e) => setNewExercise({...newExercise, addToGlobal: e.target.checked})}
              />
              Add to Global Library (shared with all users)
            </label>
            <button type="submit" disabled={!userId} style={{ padding: '8px 15px' }}>
              {newExercise.addToGlobal ? 'Add to Global Library' : 'Add to My Library'}
            </button>
          </div>
        </form>
      </section>

      {/* View Exercise Library */}
      <section style={{ marginTop: '30px', border: '1px solid #ddd', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>Exercise Library</h3>
        <button onClick={loadExerciseLibrary} disabled={!userId} style={{ marginBottom: '15px', padding: '8px 15px' }}>Refresh Library</button>
        
        {userId ? (
          <div>
            {/* Global Exercises */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ color: '#2196F3', marginBottom: '10px' }}>Global Library ({exerciseLibrary.global.length} exercises)</h4>
              {exerciseLibrary.global.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                  {exerciseLibrary.global.map((ex) => (
                    <div key={ex._id} style={{ border: '1px solid #2196F3', padding: '15px', borderRadius: '5px', backgroundColor: '#e3f2fd', position: 'relative' }}>
                      <button
                        onClick={() => handleDeleteGlobalExercise(ex._id)}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          padding: '3px 8px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.75em'
                        }}
                      >
                        Delete
                      </button>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px', marginRight: '50px' }}>{ex.name}</div>
                      <div style={{ fontSize: '0.85em', color: '#666' }}>Type: {ex.type}</div>
                      {ex.muscle_groups && ex.muscle_groups.length > 0 && (
                        <div style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
                          Muscles: {ex.muscle_groups.join(', ')}
                        </div>
                      )}
                      <div style={{ fontSize: '0.75em', color: '#999', marginTop: '5px' }}>ID: {ex.exercise_id}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666' }}>No global exercises yet.</p>
              )}
            </div>

            {/* User Custom Exercises */}
            <div>
              <h4 style={{ color: '#4CAF50', marginBottom: '10px' }}>My Custom Exercises ({exerciseLibrary.custom.length} exercises)</h4>
              {exerciseLibrary.custom.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                  {exerciseLibrary.custom.map((ex) => (
                    <div key={ex.exercise_id} style={{ border: '1px solid #4CAF50', padding: '15px', borderRadius: '5px', backgroundColor: '#f1f8f4', position: 'relative' }}>
                      <button
                        onClick={() => handleDeleteCustomExercise(ex.exercise_id)}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          padding: '3px 8px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.75em'
                        }}
                      >
                        Delete
                      </button>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px', marginRight: '50px' }}>{ex.name}</div>
                      <div style={{ fontSize: '0.85em', color: '#666' }}>Type: {ex.type}</div>
                      <div style={{ fontSize: '0.75em', color: '#999', marginTop: '5px' }}>ID: {ex.exercise_id}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666' }}>No custom exercises yet. Add some to your library!</p>
              )}
            </div>
          </div>
        ) : (
          <p style={{ color: '#666' }}>Please select a user to view the exercise library.</p>
        )}
      </section>

      {/* Create Template */}
      <section style={{ marginTop: '30px', border: '1px solid #ddd', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>Create Workout Template</h3>
        {!userId && <p style={{ color: '#f44336' }}>Please select or create a user first!</p>}
        <form onSubmit={handleCreateTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              placeholder="Template Name" 
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
              style={{ padding: '8px', width: '200px' }}
              required
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input 
                type="checkbox"
                checked={newTemplate.addToGlobal}
                onChange={(e) => setNewTemplate({...newTemplate, addToGlobal: e.target.checked})}
              />
              Add to Global Library
            </label>
            <button type="submit" disabled={!userId || !newTemplate.name || newTemplate.exercises.length === 0} style={{ padding: '8px 15px' }}>
              Create Template
            </button>
          </div>
          
          {/* Add exercises to template */}
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Add Exercises:</label>
            <select 
              onChange={(e) => {
                if (e.target.value) {
                  handleAddExerciseToTemplate(e.target.value);
                  e.target.value = "";
                }
              }}
              style={{ padding: '8px', width: '300px' }}
              disabled={!userId}
            >
              <option value="">-- Select Exercise to Add --</option>
              {exerciseLibrary.combined && exerciseLibrary.combined.map((ex) => (
                <option key={ex.exercise_id} value={ex.exercise_id}>
                  {ex.name} {ex.is_custom && '(Custom)'}
                </option>
              ))}
            </select>
          </div>

          {/* Template exercises list */}
          {newTemplate.exercises.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Template Exercises:</label>
              {newTemplate.exercises.map((ex, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#f0f0f0', marginBottom: '5px', borderRadius: '3px' }}>
                  <span>{idx + 1}. {ex.name}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveExerciseFromTemplate(idx)}
                    style={{ padding: '3px 8px', fontSize: '0.8em', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '3px' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </form>
      </section>

      {/* View Template Library */}
      <section style={{ marginTop: '30px', border: '1px solid #ddd', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>Template Library</h3>
        <button onClick={loadTemplateLibrary} disabled={!userId} style={{ marginBottom: '15px', padding: '8px 15px' }}>Refresh Templates</button>
        
        {userId ? (
          <div>
            {/* Global Templates */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ color: '#2196F3', marginBottom: '10px' }}>Global Templates ({templateLibrary.global.length})</h4>
              {templateLibrary.global.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                  {templateLibrary.global.map((t) => (
                    <div key={t._id} style={{ border: '1px solid #2196F3', padding: '15px', borderRadius: '5px', backgroundColor: '#e3f2fd', position: 'relative' }}>
                      <button
                        onClick={() => handleDeleteTemplate(t._id)}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          padding: '3px 8px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.75em'
                        }}
                      >
                        Delete
                      </button>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px', marginRight: '50px' }}>{t.name}</div>
                      <div style={{ fontSize: '0.85em', color: '#666' }}>
                        {t.exercises.length} exercise{t.exercises.length !== 1 ? 's' : ''}
                      </div>
                      <button
                        onClick={() => handleLoadTemplate(t._id)}
                        style={{ marginTop: '10px', padding: '5px 10px', fontSize: '0.85em', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', width: '100%' }}
                      >
                        Use Template
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666' }}>No global templates yet.</p>
              )}
            </div>

            {/* User Custom Templates */}
            <div>
              <h4 style={{ color: '#4CAF50', marginBottom: '10px' }}>My Templates ({templateLibrary.custom.length})</h4>
              {templateLibrary.custom.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                  {templateLibrary.custom.map((t) => (
                    <div key={t._id} style={{ border: '1px solid #4CAF50', padding: '15px', borderRadius: '5px', backgroundColor: '#f1f8f4', position: 'relative' }}>
                      <button
                        onClick={() => handleDeleteTemplate(t._id)}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          padding: '3px 8px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.75em'
                        }}
                      >
                        Delete
                      </button>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px', marginRight: '50px' }}>{t.name}</div>
                      <div style={{ fontSize: '0.85em', color: '#666' }}>
                        {t.exercises.length} exercise{t.exercises.length !== 1 ? 's' : ''}
                      </div>
                      <button
                        onClick={() => handleLoadTemplate(t._id)}
                        style={{ marginTop: '10px', padding: '5px 10px', fontSize: '0.85em', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', width: '100%' }}
                      >
                        Use Template
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666' }}>No custom templates yet. Create one above!</p>
              )}
            </div>
          </div>
        ) : (
          <p style={{ color: '#666' }}>Please select a user to view templates.</p>
        )}
      </section>

      {/* View Workouts */}
      <section style={{ marginTop: '30px', border: '1px solid #ddd', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>View Workouts</h3>
        <button onClick={fetchWorkouts} disabled={!userId} style={{ marginBottom: '15px', padding: '8px 15px' }}>Load Workouts</button>
        
        {workouts.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            {workouts.map((workout) => (
              <div key={workout._id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '5px', position: 'relative' }}>
                <button
                  onClick={() => handleDeleteWorkout(workout._id)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '0.85em'
                  }}
                >
                  Delete
                </button>
                <div style={{ fontWeight: 'bold', marginBottom: '10px', marginRight: '60px' }}>
                  {new Date(workout.date).toLocaleDateString()} - {workout.total_time_minutes} minutes
                </div>
                {workout.exercises.map((ex, idx) => (
                  <div key={idx} style={{ marginLeft: '15px', marginBottom: '10px' }}>
                    <strong>{ex.name} {ex.is_custom && <span style={{ fontSize: '0.8em', color: '#666' }}>(Custom)</span>}</strong>
                    <ul style={{ marginTop: '5px', marginLeft: '20px' }}>
                      {ex.sets.map((set, setIdx) => (
                        <li key={setIdx}>
                          Set {setIdx + 1}: {set.weight} lbs × {set.reps} reps (Difficulty: {set.difficulty}/10)
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* View All Users */}
      <section style={{ marginTop: '30px', border: '1px solid #ddd', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>View All Users</h3>
        <button onClick={fetchAllUsers} style={{ marginBottom: '15px', padding: '8px 15px' }}>Load All Users</button>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
          {allUsers.map((user) => (
            <div key={user._id} style={{ 
              border: userId === user._id ? '2px solid #2196F3' : '1px solid #ddd', 
              padding: '15px', 
              borderRadius: '5px',
              cursor: 'pointer',
              backgroundColor: userId === user._id ? '#e3f2fd' : 'white',
              position: 'relative'
            }} onClick={() => handleUserSelect(user)}>
              <button
                onClick={(e) => handleDeleteUser(user._id, e)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '5px 10px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '0.85em'
                }}
              >
                Delete
              </button>
              <strong>{user.name}</strong>
              <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                {user.email}
              </div>
              <div style={{ fontSize: '0.85em', color: '#888', marginTop: '5px' }}>
                Age: {user.age} | Weight: {user.weight_lbs} lbs
              </div>
              <div style={{ fontSize: '0.75em', color: '#aaa', marginTop: '5px', marginRight: '60px' }}>
                ID: {user._id.substring(0, 8)}...
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* View PRs */}
      <section style={{ marginTop: '30px', border: '1px solid #ddd', padding: '20px', borderRadius: '5px' }}>
        <h3>View Personal Records</h3>
        <button onClick={fetchPRs} disabled={!userId} style={{ marginBottom: '15px', padding: '8px 15px' }}>Load PRs</button>
        
        {prs.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
            {prs.map((pr) => (
              <div key={pr._id} style={{ border: '1px solid #4CAF50', padding: '15px', borderRadius: '5px', backgroundColor: '#f1f8f4' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#2E7D32' }}>
                  {getExerciseName(pr.exercise_id)}
                </div>
                <div style={{ fontSize: '1.2em', marginTop: '5px', color: '#1B5E20' }}>
                  {pr.best_weight} lbs
                </div>
                <div style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
                  Set on: {new Date(pr.date_set).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : userId && (
          <p style={{ color: '#666' }}>No personal records yet. Log a workout to create PRs!</p>
        )}
      </section>
    </div>
  );
}

export default App;
