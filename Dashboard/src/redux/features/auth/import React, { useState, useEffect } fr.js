import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { State, City } from 'country-state-city';
import { TextField, Button, Grid, Box, Snackbar, Alert, MenuItem, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MainCard from 'ui-component/cards/MainCard';

const AddMember = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [states, setStates] = useState([]); // To hold the list of states
  const [cities, setCities] = useState([]); // To hold the list of cities based on the selected state
  const [selectedState, setSelectedState] = useState(''); // Track selected state
  const [selectedCity, setSelectedCity] = useState(''); // Track selected city
  const [fileError, setFileError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // React Hook Form Setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      fatherOrHusbandName: '',
      address: {
        street: '',
        city: '',
        state: '',
        pinCode: ''
      },
      contact: {
        landline: '',
        mobile: '',
        email: ''
      },
      qualifications: [{ degree: '', institution: '', year: '' }], // Default value for qualifications
      experience: [{ company: '', role: '', years: '' }], // Default value for experience
      files: [] // Added files field for storing uploaded file URLs
    }
  });

  // UseFieldArray for dynamic fields (Qualifications and Experience)
  const { fields: qualificationFields, remove: removeQualification } = useFieldArray({
    control,
    name: 'qualifications'
  });

  const { fields: experienceFields, remove: removeExperience } = useFieldArray({
    control,
    name: 'experience'
  });

  // Fetch States of India
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const statesData = await State.getStatesOfCountry('IN'); // Fetch all states in India
        const statesList = statesData.map(({ isoCode, name }) => ({
          value: isoCode,
          label: name
        }));
        setStates(statesList);
      } catch (error) {
        setStates([]);
      }
    };

    fetchStates();
  }, []);

  // Fetch Cities based on selected State
  const handleStateChange = async (e) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);

    // Fetch cities for the selected state
    if (stateCode) {
      try {
        const citiesData = await City.getCitiesOfState('IN', stateCode);
        const citiesList = citiesData.map(({ name }) => ({
          value: name,
          label: name
        }));
        setCities(citiesList);
      } catch (error) {
        setCities([]);
      }
    } else {
      setCities([]); // If no state is selected, reset cities
    }
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
  };

  // Handle form submission
  const onSubmit = (data) => {
    console.log('Form Data:', data); // Log form data on submission
    setSnackbar({
      open: true,
      message: 'Member added successfully!',
      severity: 'success'
    });
    reset();
  };

  const { append: appendQualification } = useFieldArray({
    control,
    name: 'qualifications'
  });

  const { append: appendExperience } = useFieldArray({
    control,
    name: 'experience'
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setFileError('You can only upload a maximum of 5 files.');
      e.target.value = '';
      return;
    }

    const isValidSize = files.every((file) => file.size <= 5 * 1024 * 1024);
    if (!isValidSize) {
      setFileError('File must be less than 5 MB.');
      e.target.value = '';
      return;
    }
    setFileError('');
    const fileUrls = files.map((file) => URL.createObjectURL(file));
    setValue('files', fileUrls);
  };

  const qualificationsCount = watch('qualifications').length;
  const experiencesCount = watch('experience').length;

  return (
    <MainCard title="Add New Member">
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* First Name */}
          <Grid item xs={6} sm={4}>
            <Controller
              name="firstName"
              control={control}
              rules={{ required: 'First Name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="First Name"
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  variant="outlined"
                />
              )}
            />
          </Grid>

          {/* Last Name */}
          <Grid item xs={6} sm={4}>
            <Controller
              name="lastName"
              control={control}
              rules={{ required: 'Last Name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Last Name"
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  variant="outlined"
                />
              )}
            />
          </Grid>

          {/* Date of Birth */}
          <Grid item xs={6} sm={4}>
            <Controller
              name="dateOfBirth"
              control={control}
              rules={{ required: 'Date of Birth is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth?.message}
                  variant="outlined"
                />
              )}
            />
          </Grid>

          {/* Gender */}
          <Grid item xs={6} sm={4}>
            <Controller
              name="gender"
              control={control}
              rules={{ required: 'Gender is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Gender"
                  error={!!errors.gender}
                  helperText={errors.gender?.message}
                  variant="outlined"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          {/* Father or Husband Name */}
          <Grid item xs={6} sm={4}>
            <Controller
              name="fatherOrHusbandName"
              control={control}
              rules={{ required: "Father or Husband's Name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Father or Husband's Name"
                  error={!!errors.fatherOrHusbandName}
                  helperText={errors.fatherOrHusbandName?.message}
                  variant="outlined"
                />
              )}
            />
          </Grid>

          {/* Street Address */}
          <Grid item xs={6} sm={4}>
            <Controller
              name="address.street"
              control={control}
              rules={{ required: 'Street address is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Street Address"
                  error={!!errors.address?.street}
                  helperText={errors.address?.street?.message}
                  variant="outlined"
                />
              )}
            />
          </Grid>

          {/* State Selection */}
          <Grid item xs={6} sm={4}>
            <Controller
              name="address.state"
              control={control}
              rules={{ required: 'State is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="State"
                  error={!!errors.address?.state}
                  helperText={errors.address?.state?.message}
                  variant="outlined"
                  onChange={(e) => {
                    field.onChange(e); // Update react-hook-form state
                    handleStateChange(e); // Fetch cities for selected state
                  }}
                >
                  {states.map((state) => (
                    <MenuItem key={state.value} value={state.value}>
                      {state.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* City Selection */}
          <Grid item xs={6} sm={4}>
            <Controller
              name="address.city"
              control={control}
              rules={{ required: 'City is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="City"
                  error={!!errors.address?.city}
                  helperText={errors.address?.city?.message}
                  variant="outlined"
                >
                  {cities.map((city) => (
                    <MenuItem key={city.value} value={city.value}>
                      {city.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Pin Code */}
          <Grid item xs={6} sm={4}>
            <Controller
              name="address.pinCode"
              control={control}
              rules={{
                required: 'Pin Code is required',
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: 'Invalid Pin Code'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Pin Code"
                  error={!!errors.address?.pinCode}
                  helperText={errors.address?.pinCode?.message}
                  variant="outlined"
                />
              )}
            />
          </Grid>

          {/* Mobile Number */}
          <Grid item xs={6} sm={4}>
            <Controller
              name="contact.mobile"
              control={control}
              rules={{
                required: 'Mobile is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Invalid Mobile Number'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Mobile"
                  error={!!errors.contact?.mobile}
                  helperText={errors.contact?.mobile?.message}
                  variant="outlined"
                />
              )}
            />
          </Grid>

          {/* Landline */}
          <Grid item xs={6} sm={4}>
            <Controller
              name="contact.landline"
              control={control}
              render={({ field }) => <TextField {...field} fullWidth label="Landline" variant="outlined" />}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={6} sm={4}>
            <Controller
              name="contact.email"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                  message: 'Invalid email address'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  error={!!errors.contact?.email}
                  helperText={errors.contact?.email?.message}
                  variant="outlined"
                />
              )}
            />
          </Grid>

          {/* Qualifications Section */}
          <Grid item xs={12}>
            <Typography variant="h6">Qualifications</Typography>
            {qualificationFields.map((item, index) => (
              <Box key={item.id} mb={2}>
                <Grid container spacing={3}>
                  <Grid item xs={3}>
                    <Controller
                      name={`qualifications[${index}].degree`}
                      control={control}
                      rules={{ required: 'Degree is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Degree"
                          error={!!errors.qualifications?.[index]?.degree}
                          helperText={errors.qualifications?.[index]?.degree?.message}
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Controller
                      name={`qualifications[${index}].institution`}
                      control={control}
                      rules={{ required: 'Institution is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Institution"
                          error={!!errors.qualifications?.[index]?.institution}
                          helperText={errors.qualifications?.[index]?.institution?.message}
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Controller
                      name={`qualifications[${index}].year`}
                      control={control}
                      rules={{ required: 'Year of Graduation is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Year"
                          type="number"
                          error={!!errors.qualifications?.[index]?.year}
                          helperText={errors.qualifications?.[index]?.year?.message}
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button variant="contained" color="primary" onClick={() => appendQualification({ degree: '', institution: '', year: '' })}>
              Add Qualification
            </Button>
          </Grid>

          {/* Experience Section */}
          <Grid item xs={12}>
            <Typography variant="h6">Experience</Typography>
            {experienceFields.map((item, index) => (
              <Grid container key={item.id} spacing={2}>
                <Grid item xs={4}>
                  <Controller
                    name={`experience[${index}].company`}
                    control={control}
                    rules={{ required: 'Company Name is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Company"
                        error={!!errors.experience?.[index]?.company}
                        helperText={errors.experience?.[index]?.company?.message}
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Controller
                    name={`experience[${index}].role`}
                    control={control}
                    rules={{ required: 'Role is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Role"
                        error={!!errors.experience?.[index]?.role}
                        helperText={errors.experience?.[index]?.role?.message}
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Controller
                    name={`experience[${index}].years`}
                    control={control}
                    rules={{ required: 'Years of Experience is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Years of Experience"
                        error={!!errors.experience?.[index]?.years}
                        helperText={errors.experience?.[index]?.years?.message}
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" color="secondary" onClick={() => removeExperience(index)}>
                    Remove
                  </Button>
                </Grid>
              </Grid>
            ))}
            <Button variant="contained" color="primary" onClick={() => appendExperience({ company: '', role: '', years: '' })}>
              Add Experience
            </Button>
          </Grid>

          {/* File Upload */}
          <Grid item xs={12}>
  <Typography variant="h6">Upload Photo</Typography>
  <Button variant="contained" component="label" color="primary">
    Upload Image
    <input 
      type="file" 
      hidden 
      accept=".jpg, .png, .jpeg" 
      onChange={handleFileChange} 
      multiple 
    />
  </Button>
  <Typography variant="body2" id="fileError" color="error" />
  <Box sx={{ mt: 2 }}>
   
    <Grid container spacing={2}>
      {watch('files').map((file, index) => (
        <Grid item xs={4} sm={3} key={index}>
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '5px',
              textAlign: 'center',
            }}
          >
            <img
              src={URL.createObjectURL(file)}
              alt={`Uploaded ${index + 1}`}
              style={{
                width: '100%',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
            <Typography variant="body2" noWrap>
              {file.name}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Box>
</Grid>

<Grid item xs={12}>
  <Typography variant="h6">Upload Signature</Typography>
  <Button variant="contained" component="label" color="primary">
    Upload Image
    <input 
      type="file" 
      hidden 
      accept=".jpg, .png, .jpeg" 
      onChange={handleFileChange} 
      multiple 
    />
  </Button>
  <Typography variant="body2" id="fileError" color="error" />
  <Box sx={{ mt: 2 }}>
    
    <Grid container spacing={2}>
      {watch('files').map((file, index) => (
        <Grid item xs={4} sm={3} key={index}>
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '5px',
              textAlign: 'center',
            }}
          >
            <img
              src={URL.createObjectURL(file)}
              alt={`Uploaded ${index + 1}`}
              style={{
                width: '100%',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
            <Typography variant="body2" noWrap>
              {file.name}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Box>
</Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Upload Documents</Typography>
            <Button variant="contained" component="label" color="primary">
              Upload Document
              <input type="file" hidden accept=".pdf, .jpg, .png, .jpeg" onChange={handleFileChange} multiple />
            </Button>
            <Typography variant="body2" id="fileError" color="error" />
          
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" size="large">
              Submit
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => reset()} // Clear form fields
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Snackbar for Success */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          iconMapping={{ success: <CheckCircleIcon /> }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default AddMember;
