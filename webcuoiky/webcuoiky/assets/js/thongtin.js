document.addEventListener('DOMContentLoaded', () => {
  // Thêm CSS cho gallery ảnh và modal chi tiết
  const style = document.createElement('style');
  style.textContent = `
    .modal-content {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 1.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      padding: 2rem;
      max-width: 700px;
      margin: 10% auto;
      position: relative;
      transition: all 0.3s ease;
    }
    .members-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.5rem;
      padding: 1.5rem 0;
      justify-items: center;
    }
    .members-gallery img {
      width: 180px;
      height: 180px;
      object-fit: cover;
      border-radius: 1.2rem;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border: 2px solid rgba(46, 125, 50, 0.2);
    }
    .members-gallery img:hover {
      transform: scale(1.08);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
      border-color: var(--first-color);
    }
    .modal h2 {
      font-size: 1.8rem;
      color: var(--title-color);
      text-align: center;
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .member-detail {
      text-align: center;
    }
    .member-detail img {
      width: 220px;
      height: 220px;
      object-fit: cover;
      border-radius: 1.2rem;
      margin: 0 auto 1.5rem;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
    .member-detail h3 {
      color: var(--title-color);
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    .member-detail p {
      color: var(--text-color);
      line-height: 1.6;
      font-size: 1rem;
    }
    .member-detail p strong {
      color: var(--first-color);
    }
    @media screen and (max-width: 768px) {
      .modal-content {
        width: 90%;
        margin: 15% auto;
        padding: 1.5rem;
      }
      .members-gallery {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
      }
      .members-gallery img {
        width: 150px;
        height: 150px;
      }
      .modal h2 {
        font-size: 1.5rem;
      }
    }
    @media screen and (max-width: 480px) {
      .modal-content {
        width: 95%;
        margin: 20% auto;
        padding: 1rem;
      }
      .members-gallery img {
        width: 120px;
        height: 120px;
      }
    }
  `;
  document.head.appendChild(style);

  const btnModal1 = document.querySelector('.card__button[data-modal="modal1"]');
  const modal1 = document.getElementById('modal1');
  const modal1Large = document.getElementById('modal1_large');

  // Dữ liệu mẫu cho thông tin thành viên
  const members = [
    {
      id: 1,
      img: 'assets/img/thanhvien1.PNG',
      name: 'Võ Tiến Đạt',
      role: 'Trưởng nhóm',
      description: 'MSSV:22161239.'
    },
    {
      id: 2,
      img: 'assets/img/thanhvien2.png',
      name: 'Trương Thành Đắc',
      role: 'Thành viên của nhóm',
      description: 'MSSV:22161240'
    },
    {
      id: 3,
      img: 'assets/img/thanhvien3.png',
      name: 'Lê Mỹ Hoàng ',
      role: 'Thành viên của nhóm ',
      description: 'MSSV:22161257'
    }
  ];

  const modal1ContentHTML = `
    <span class="close" id="closeModal1">×</span>
    <h2>Ảnh các thành viên nhóm</h2>
    <div class="members-gallery">
      ${members.map(member => `<img src="${member.img}" alt="${member.name}" data-member-id="${member.id}" />`).join('')}
    </div>
  `;

  btnModal1.addEventListener('click', e => {
    e.preventDefault();
    modal1.querySelector('.modal-content').innerHTML = modal1ContentHTML;
    modal1.style.display = 'block';
    modal1.style.opacity = 1;
    document.body.style.overflow = 'hidden';

    // Thêm sự kiện click cho các ảnh thành viên
    const memberImages = modal1.querySelectorAll('.members-gallery img');
    memberImages.forEach(img => {
      img.addEventListener('click', () => {
        const memberId = img.getAttribute('data-member-id');
        const member = members.find(m => m.id == memberId);
        if (member) {
          const modal1LargeContentHTML = `
            <span class="close" id="closeModal1Large">×</span>
            <div class="member-detail">
              <img src="${member.img}" alt="${member.name}" />
              <h3>${member.name}</h3>
              <p><strong>Vai trò:</strong> ${member.role}</p>
              <p>${member.description}</p>
            </div>
          `;
          modal1Large.querySelector('.modal-content').innerHTML = modal1LargeContentHTML;

          // Hiệu ứng mờ dần để chuyển đổi modal
          modal1.style.transition = 'opacity 0.3s ease';
          modal1.style.opacity = 0;
          setTimeout(() => {
            modal1.style.display = 'none';
            modal1Large.style.display = 'block';
            modal1Large.style.opacity = 0;
            modal1Large.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
              modal1Large.style.opacity = 1;
            }, 20);
          }, 300);

          // Sự kiện đóng modal1_large
          modal1Large.querySelector('#closeModal1Large').addEventListener('click', () => {
            modal1Large.style.transition = 'opacity 0.3s ease';
            modal1Large.style.opacity = 0;
            setTimeout(() => {
              modal1Large.style.display = 'none';
              modal1.style.display = 'block';
              modal1.style.opacity = 0;
              modal1.style.transition = 'opacity 0.3s ease';
              setTimeout(() => {
                modal1.style.opacity = 1;
              }, 20);
            }, 300);
          });
        }
      });
    });

    // Sự kiện đóng modal1
    modal1.querySelector('#closeModal1').addEventListener('click', () => {
      modal1.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
  });

  // Đóng modal khi click ra ngoài
  window.addEventListener('click', e => {
    if (e.target === modal1) {
      modal1.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
    if (e.target === modal1Large) {
      modal1Large.style.transition = 'opacity 0.3s ease';
      modal1Large.style.opacity = 0;
      setTimeout(() => {
        modal1Large.style.display = 'none';
        modal1.style.display = 'block';
        modal1.style.opacity = 0;
        modal1.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          modal1.style.opacity = 1;
        }, 20);
      }, 300);
    }
  });
});
