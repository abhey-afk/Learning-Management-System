import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCreatorCourseQuery } from '../../../features/api/courseApi';

const CourseTable = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetCreatorCourseQuery();
  console.log("API DATA", data);
  const courses = data?.courses || [];
  console.log("Courses array:", courses);

  // Loading state
  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Loading courses...
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: {error?.data?.message || 'Failed to load courses'}
      </div>
    );
  }

  // Empty state
  if (!courses?.length) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>No courses found. Create your first course!</p>
        <button
          onClick={() => navigate('create')}
          style={createButtonStyle}
        >
          Create New Course
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Your Courses</h2>
        <button
          onClick={() => navigate('create')}
          style={createButtonStyle}
        >
          Create New Course
        </button>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Price</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course._id} style={trStyle}>
              <td style={tdStyle}>{course.courseTitle}</td>
              <td style={tdStyle}>
                <span style={getStatusStyle(course.isPublished)}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </td>
              <td style={tdStyle}>{course.coursePrice ? `$${course.coursePrice}` : 'NA'}</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                <button
                  onClick={() => navigate(`edit/${course._id}`)}
                  style={editButtonStyle}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Styling constants
const createButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#4f46e5',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: '#4338ca',
  },
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: 'white',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  borderRadius: '8px',
  overflow: 'hidden',
};

const thStyle = {
  backgroundColor: '#f9fafb',
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  borderBottom: '1px solid #e5e7eb',
};

const tdStyle = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#4b5563',
  borderBottom: '1px solid #e5e7eb',
};

const trStyle = {
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: '#f9fafb',
  },
};

const getStatusStyle = (isPublished) => ({
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '500',
  backgroundColor: isPublished ? '#dcfce7' : '#fef3c7',
  color: isPublished ? '#166534' : '#92400e',
});

const editButtonStyle = {
  padding: '6px 12px',
  backgroundColor: 'transparent',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  color: '#374151',
  fontSize: '13px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: '#f3f4f6',
    borderColor: '#9ca3af',
  },
};

export default CourseTable;