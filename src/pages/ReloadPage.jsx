import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ReloadPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem('return_to_discussion'));
    if (data?.id) {
      navigate(`/discussion/${data.id}`, { state: { scrollTo: data.scrollTo } });
    } else {
      navigate('/mindvault');
    }
  }, [navigate]);

  return null; 
}

export default ReloadPage;
